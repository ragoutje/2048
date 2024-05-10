<script setup lang="ts">
import {onBeforeMount, ref, Ref, TransitionGroup, unref} from "vue";
import { useSwipe } from "./Touchable";

type MatrixIndice = Array<number>;
type Matrix = Array<MatrixIndice>;

const generateMatrix = (xSize: number, ySize: number): Matrix => {
  let matrix: Matrix = [];

  for (let x = 0; x < xSize; x++) {
    let indiceY: MatrixIndice = [];

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

onBeforeMount(() => {
  writeMatrixToRef(
    setRandomNumber(unref(matrix), 1)
);
  
  addEventListener("keydown", (e) => {
    const map = directionMaps.find(map => map.keyCodes.includes(e.key))
    if (typeof map !== 'undefined') {
      handleMove(unref(matrix), map);
    }
  });

  const { onSwipeLeft, onSwipeUp, onSwipeRight, onSwipeDown } = useSwipe(document.body);
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

const writeMatrixToRef = (newMatrix: Matrix) => {
  newMatrix.forEach(
    (newRow, iRow) => newRow.forEach(
      (newCell, iCell) => matrix.value[iRow][iCell] = newCell
    )
  )
}

// TODO compare both matrices to eachother for stric value equality
const isValidMove = (oldMatrix: Matrix, newMatrix: Matrix): boolean => {
  return true;
};

const hasMovesLeft = (matrix: Matrix): boolean => matrix.flat().includes(0);
const hasWinningNumber = (matrix: Matrix): boolean => matrix.flat().includes(finishNumber);

const handleMove = (oldMatrix: Matrix, directionMap: any) => {
  // shallowCopy and rotate for movement fn
  let adjustedMatrix: Matrix = compose(directionMap.preRotate, shallowCopyMatrix)(oldMatrix);

  // move and rotate back
  adjustedMatrix = compose(directionMap.postRotate, moveCells)(adjustedMatrix);
  

  // Validate for valid movement before adding a new start cell
  if (isValidMove(oldMatrix, adjustedMatrix)) {
    adjustedMatrix = setRandomNumber(adjustedMatrix, 1);
    writeMatrixToRef(adjustedMatrix);
  }

  const hasLost: boolean = !hasMovesLeft(adjustedMatrix);
  const hasWon: boolean = hasWinningNumber(adjustedMatrix);

  if (hasLost || hasWon) {
    if (confirm(hasLost ? 'You lost! Start a new game?' : 'You won! Start a new game?')) {
      writeMatrixToRef(generateMatrix(gridSize, gridSize));
    }
  }
}

// TODO clean up loopy code
const moveCells = (matrix: Matrix): Matrix => {
  const oldMatrix = shallowCopyMatrix(matrix);
  let newMatrix: Matrix = [];

  // Loop through rows
  for (let iRow = 0; iRow < oldMatrix.length; iRow++) {

    // Loop through cells in a row, from left to right
    let rowCells = oldMatrix[iRow];
    for(let iCell = 0; iCell < rowCells.length; iCell++) {

      // Loop through row, from left to right
      // to discover other values, and merge them to the left
      // TODO: only merge cells adjacent to eachother
      for(let iAdjCell = 0; iAdjCell < rowCells.length; iAdjCell++) {

        // Only check values to the right of our current cell
        // Only above 0 do we need to merge/move
        if (iAdjCell > iCell && rowCells[iAdjCell] > 0) {
          // iCell is 0. Any value gets moved to iCell
          if (rowCells[iCell] === 0) {
            rowCells[iCell] = rowCells[iAdjCell];
            rowCells[iAdjCell] = 0;

          // iCell has a value. Only cells with the exact same value get merged
          } else if (rowCells[iCell] === rowCells[iAdjCell]) {
            rowCells[iCell] = rowCells[iCell] + rowCells[iAdjCell];
            rowCells[iAdjCell] = 0;
          }
        }

      }
    }

    newMatrix[iRow] = rowCells;
  }

  return newMatrix;
}

const gridCellClass = (cellVal: number): string => `grid-cell--${cellVal}`;
</script>

<template>
  <div class="game-container">
    <h1>2048</h1>
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
  </div>
</template>
