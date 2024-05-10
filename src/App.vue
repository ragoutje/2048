<script setup lang="ts">
import {onBeforeMount, ref, Ref, unref} from "vue";

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

// TODO validate usage and correctness for this 2048 game
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
  setRandomNumber(1);

  addEventListener("keydown", (e) => {
    const map = directionMaps.find(map => map.keyCodes.includes(e.key))
    if (typeof map !== 'undefined') {
      handleMove(unref(matrix), map);
    }
  });
});

// TODO: make it a pure function taking a matrix and returning a new one with added numbers
const setRandomNumber = (amount: number) => {
  let times = 0;
  let loops = 0;

  while (times < amount) {
    loops++;

    const randIRow = Math.floor((Math.random() * gridSize));
    const randICol = Math.floor((Math.random() * gridSize));

    // Only add if the value 
    if (matrix.value[randIRow][randICol] <= 0) {
      matrix.value[randIRow][randICol] = startValue
      times++;
    }
  }
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

const handleMove = (oldMatrix: Matrix, directionMap: any) => {
  // shallowCopy and rotate for movement fn
  let adjustedMatrix: Matrix = compose(directionMap.preRotate, shallowCopyMatrix)(oldMatrix);

  // move and rotate back
  adjustedMatrix = compose(directionMap.postRotate, moveCells)(adjustedMatrix);
  

  // Validate for valid movement before adding a new start cell
  if (isValidMove(oldMatrix, adjustedMatrix)) {
    writeMatrixToRef(adjustedMatrix);
    // TODO: Watch for loss conditions watcher fn
    // TODO: Watch for win conditions watcher fn
    setRandomNumber(1);
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
</script>

<template>
  <div class="grid">
    <template v-for="rows in matrix">
      <div class="grid-cell" v-for="(cell, i) in rows">{{ cell ? cell : '' }}</div>
    </template>
  </div>
</template>
