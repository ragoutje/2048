<script setup lang="ts">
import {onBeforeMount, ref, Ref, unref} from "vue";
import { useSwipe } from "./Touchable";

const { onSwipeLeft, onSwipeUp, onSwipeRight, onSwipeDown } = useSwipe(document.body);

type MatrixRow = Array<number>;
type Matrix = Array<MatrixRow>;

const generateMatrix = (xSize: number, ySize: number): Matrix => {
  let matrix: Matrix = [];

  for (let x = 0; x < xSize; x++) {
    let indiceY: MatrixRow = [];

    for (let y = 0; y < ySize; y++) {
      indiceY.push(0);
    }

    matrix.push(indiceY);
  }

  return matrix;
}

const compose = (a: Function, b: Function): Function => (x: any): Function => a(b(x));
const map = (fn: any, arr: any[]): any[] => arr.map(fn); // composable map fn which accepts a fn as first argument
const get = (i: number): Function => (arr: any[]): any => arr[i];
const shallow = (arr: any[]): any[] => [...arr]; // Shallow copy top level of an array
const reverse = (arr: any[]): any[] => shallow(arr).reverse(); // reverse the top level(rows) in the matrix, not the content of the rows
const pluck = (i: number, matrix: any[]) => map(get(i), matrix); // get value i from all rows in the matrix
const rangeFrom = ({length}: {length: number}): any[] => [...Array(length).keys()]; // Make an new array with n entries, their value is equal to their index
const shallowCopyMatrix = (matrix: Matrix): Matrix => map(shallow, shallow(matrix)); // Shallow copy of the rows and row contents in the matrix
const mirrorMatrix = (matrix: Matrix): Matrix => map(reverse, shallow(matrix)); // Reverse the row contents in the matrix
const flipMatrix = (matrix: any[]) => map((i: number) => pluck(i, matrix), rangeFrom(matrix));
const rotateMatrix = compose(flipMatrix, reverse);
const flipMatrixCounterClockwise = compose(reverse, rotateMatrix);
const rotateMatrixCounterClockwise = compose(reverse, flipMatrix);

const gridSize: number = 4;
const startValue = 2;
const finishNumber = 2048;
const directionMaps = [
  {
    'direction': 'left',
    'keyCodes': ['ArrowLeft'],
    'preRotate': (m: Matrix): Matrix => m,
    'postRotate': (m: Matrix): Matrix => m,
  },
  {
    'direction': 'up',
    'keyCodes': ['ArrowUp'],
    'preRotate': rotateMatrixCounterClockwise,
    'postRotate': rotateMatrix,
  },
  {
    'direction': 'right',
    'keyCodes': ['ArrowRight'],
    'preRotate': mirrorMatrix,
    'postRotate': mirrorMatrix,
  },
  {
    'direction': 'down',
    'keyCodes': ['ArrowDown'],
    'preRotate': rotateMatrix,
    'postRotate': rotateMatrixCounterClockwise,
  },
];
let matrix: Ref<Matrix> = ref(generateMatrix(gridSize, gridSize));

const startNewGame = () => writeMatrixToRef(setRandomNumber(generateMatrix(gridSize, gridSize), 1));

onBeforeMount(() => {
  startNewGame();
  
  addEventListener("keydown", (e) => {
    const map = directionMaps.find(map => map.keyCodes.includes(e.key))
    if (typeof map !== 'undefined') {
      handleMove(unref(matrix), map);
    }
  });

  onSwipeLeft((e:TouchEvent) => handleMove(unref(matrix), directionMaps.find(map => map.direction ==='left')));
  onSwipeUp((e:TouchEvent) => handleMove(unref(matrix), directionMaps.find(map => map.direction ==='up')));
  onSwipeRight((e:TouchEvent) => handleMove(unref(matrix), directionMaps.find(map => map.direction ==='right')));
  onSwipeDown((e:TouchEvent) => handleMove(unref(matrix), directionMaps.find(map => map.direction ==='down')));
});

const setRandomNumber = (matrix: Matrix, amount: number): Matrix => {
  let adjustedMatrix = shallowCopyMatrix(matrix);

  let times = 0;
  let loops = 0;

  while (times < amount) {
    loops++;

    const randIRow = Math.floor((Math.random() * gridSize));
    const randICol = Math.floor((Math.random() * gridSize));

    // Only add a random number of its cell was previously empty
    if (adjustedMatrix[randIRow][randICol] <= 0) {
      adjustedMatrix[randIRow][randICol] = startValue
      times++;
    }
  }

  return adjustedMatrix;
}

const writeMatrixToRef = (newMatrix: Matrix) => newMatrix.forEach(
  (newRow, iRow) => newRow.forEach(
    (newCell, iCell) => matrix.value[iRow][iCell] = newCell
  )
);

const isValidMove = (matrix: Matrix): boolean => {
  let hasZeroBeforeLastCell = false; // <-0,2,4,8 = valid; <-2,4,8,0 = not valid;
  let hasAdjacentDuplicate = false; // <-2,4,4,16 = valid; <-2,4,16,4 =  not valid;

  matrix.forEach(row => {    
    row.forEach((cell, iCell) => {
      if (iCell !== row.length-1 && cell === 0) hasZeroBeforeLastCell = true;
      if (cell === row[iCell+1]) hasAdjacentDuplicate = true;
    });
  });

  return hasAdjacentDuplicate || hasZeroBeforeLastCell;
};

const hasMovesLeft = (matrix: Matrix): boolean => {
  let hasValidMoves = false;

  directionMaps.forEach(map => {
    const adjustedMatrix = map.preRotate(shallowCopyMatrix(matrix));
    if (isValidMove(adjustedMatrix)) hasValidMoves = true;
  });

  return hasValidMoves;
};
const hasWinningNumber = (matrix: Matrix): boolean => matrix.flat().includes(finishNumber);

const handleMove = (oldMatrix: Matrix, directionMap: any) => {
  let adjustedMatrix: Matrix = compose(directionMap.preRotate, shallowCopyMatrix)(oldMatrix);  
  
  if (isValidMove(adjustedMatrix)) {
    adjustedMatrix = compose(directionMap.postRotate, moveCells)(adjustedMatrix);
    writeMatrixToRef(adjustedMatrix);
    setTimeout(() => {
      adjustedMatrix = setRandomNumber(adjustedMatrix, 1);
      writeMatrixToRef(adjustedMatrix);
    }, 50);
    
    const hasLost: boolean = !hasMovesLeft(unref(matrix));
    const hasWon: boolean = hasWinningNumber(unref(matrix));  
    if (hasLost || hasWon) {
      if (confirm(hasLost ? 'You lost! Start a new game?' : 'You won! Start a new game?')) {
        writeMatrixToRef(generateMatrix(gridSize, gridSize));
      }
    }
  }
}

const moveZeroesToEnd = (arr: number[]): number[] => {
  let zeros: number[] = [];
  let newArr: number [] = [];

  newArr = arr.filter(item => (item !== 0 ? true : zeros.push(item) && false));

  return newArr.concat(zeros);
}

const moveCells = (matrix: Matrix): Matrix => {
  let newMatrix: Matrix = shallowCopyMatrix(matrix);

  matrix.forEach((row, iRow) => {
    let newRow = moveZeroesToEnd([...row]);

    row.forEach((_cell, iCell) => {
      const iAdj = iCell+1;
      const nextCellIsSameValue = iAdj <= newRow.length ? newRow[iCell] === newRow[iAdj] : false;

      if (nextCellIsSameValue) {
        newRow[iCell] = newRow[iCell] + newRow[iAdj];
        newRow[iAdj] = 0;
        newRow = moveZeroesToEnd(newRow);
      }
    });

    newMatrix[iRow] = newRow;
  });

  return newMatrix;
}

const gridCellClass = (cellVal: number): string => `grid-cell--${cellVal}`;
</script>

<template>
  <!-- <h1>
    2048
    <button @click="startNewGame">New game</button>
  </h1> -->
  <div class="grid">
    <template v-for="(row, iRow) in matrix">
      <div
        v-for="(cell, iCell) in row"
        :key="`cell-${iRow}-${iCell}`"
        class="grid-cell"
        :class="[gridCellClass(cell)]"
      >
        {{ cell ? cell : '' }}
      </div>
    </template>
  </div>
</template>
