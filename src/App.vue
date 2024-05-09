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

const gridSize: number = 4;
const startValue = 2;
const finishNumber = 2048;
const directionMap = { 'ArrowLeft': 'left', 'ArrowRight': 'right', 'ArrowUp': 'up', 'ArrowDown': 'down' };
let matrix: Ref<Matrix> = ref(generateMatrix(gridSize, gridSize));

onBeforeMount(() => {
  // setRandomStartNumber();
  matrix.value[0][1] = 2;
  matrix.value[0][2] = 2;

  addEventListener("keydown", (e) => {
    if (['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(e.key)) {
      handleMove(directionMap[e.key]);
    }
  });
});

const setRandomStartNumber = () => {
  const randIRow = Math.floor((Math.random() * gridSize));
  const randICol = Math.floor((Math.random() * gridSize));

  matrix.value[randIRow][randICol] = startValue;
}

const handleMove = (direction: string) => {
  let adjustedMatrix: Matrix = [ ...unref(matrix) ];
  
  // Rotate/flip grid fn
  adjustedMatrix = rotateDirectional(adjustedMatrix, direction);
  console.log(adjustedMatrix);
  
  // Validate if cells can be moved fn
  let isValid = true;
  if (!isValid) return;
  
  // Move cells fn
  adjustedMatrix = moveCells(adjustedMatrix);
  console.log(adjustedMatrix);
  
  // Rotate/flip grid back fn
  
  // Write cells to matrix ref
  // Trigger new random cell value fn
  
  // Watch for loss conditions watcher fn
  // Watch for win conditions watcher fn
}

const compose = (a: Function, b: Function): Function => (x: any): Function => a(b(x));
const reverse = (arr: any[]): any[] => [...arr].reverse();
const get = (i: number): Function => (arr: any[]): any => arr[i];
const map = (fn: any, arr: any[]) => arr.map(fn);
const pluck = (i: number, matrix: any[]) => map(get(i), matrix);
const rangeFrom = ({length}): any[] => [...Array(length).keys()];
const flipMatrix = (matrix: any[]) => map((i: number) => pluck(i, matrix), rangeFrom(matrix));
const rotateMatrix = compose(flipMatrix, reverse);
const flipMatrixCounterClockwise = compose(reverse, rotateMatrix);
const rotateMatrixCounterClockwise = compose(reverse, flipMatrix);

const shallowCopyMatrix = (matrix: any[][]): any[][] => {
  let shallowCopy = [];

  for(let iRow = 0; iRow < matrix.length; iRow++) {
    let newRow = [];
    for(let iCell = 0; iCell < matrix.length; iCell++) {
      newRow.push(matrix[iRow][iCell]);
    }
    shallowCopy.push(newRow);
  }
  return shallowCopy;
}

const rotateDirectional = (matrix: Matrix, direction: string): Matrix => {
  let rotatedMatrix: Matrix = shallowCopyMatrix(matrix);

  if (direction === 'right') {
    // WHY does flip rotate 90c clockwise?
    // rotatedMatrix = rotateMatrixCounterClockwise(rotatedMatrix);
  }
  if (direction === 'up') {
    rotatedMatrix = rotateMatrix(rotatedMatrix);
  }
  if (direction === 'down') {
    rotatedMatrix = rotateMatrixCounterClockwise(rotatedMatrix);
  }

  return [ ...rotatedMatrix ];
};

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
