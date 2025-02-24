<script setup lang="ts">
import {onBeforeMount, ref, Ref, unref} from "vue";
import { compose } from "./utils/function-helpers";
import { DirectionMap, Matrix } from './types/matrix';
import { directionMaps, generateMatrix, hasMovesLeft, hasWinningNumber, isValidMove, moveCells, setRandomNumber, shallowCopyMatrix } from "./utils/matrix-helpers";

const gridSize: number = 4;
const startValue = 2;
const startAmount = 2;
const followUpAmount = 1;
const finishNumber = 2048;
const matrix: Ref<Matrix> = ref(generateMatrix(gridSize)); // Init an empty matrix to prevent possible undefined

// Refs in Vue don't handle JS object change tracking well so we have to spell the changes out like this
const writeMatrixToRef = (newMatrix: Matrix) => newMatrix.forEach(
  (newRow, iRow) => newRow.forEach(
    (newCell, iCell) => matrix.value[iRow][iCell] = newCell
  )
);

const startNewGame = (): void => {
  writeMatrixToRef(setRandomNumber(generateMatrix(gridSize), startValue, startAmount));
};

onBeforeMount(() => {
  startNewGame();
  
  // Listen for movements
  addEventListener("keydown", (e) => {
    const map = directionMaps.find((map: DirectionMap) => map.keyCodes.includes(e.key))
    if (typeof map !== 'undefined') {
      handleMove(unref(matrix), map);
    }
  });
  // onSwipeLeft((_e:TouchEvent) => handleMove(unref(matrix), directionMaps.find((map: DirectionMap) => map.direction ==='left')));
  // onSwipeUp((_e:TouchEvent) => handleMove(unref(matrix), directionMaps.find((map: DirectionMap) => map.direction ==='up')));
  // onSwipeRight((_e:TouchEvent) => handleMove(unref(matrix), directionMaps.find((map: DirectionMap) => map.direction ==='right')));
  // onSwipeDown((_e:TouchEvent) => handleMove(unref(matrix), directionMaps.find((map: DirectionMap) => map.direction ==='down')));
});

const handleMove = (oldMatrix: Matrix, directionMap: DirectionMap | undefined) => {
  if (directionMap === undefined) return;

  // We rotate/mirror the matrix so that moveCells only has to work a single direction
  const adjustedMatrix: Matrix = compose(directionMap.preRotate, shallowCopyMatrix)(oldMatrix);
  
  // If there is no valid move left we do nothing
  if (!isValidMove(adjustedMatrix)) return;
  
  // We rotate/mirror the matrix back and save the move.
  writeMatrixToRef(compose(directionMap.postRotate, moveCells)(adjustedMatrix));

  // By now we can see if there is a winning number
  if (hasWinningNumber(unref(matrix), finishNumber)) {

    // Confirm: new game starts. Cancel: continu the game
    if (confirm('You won! Start a new game?')) {
      startNewGame();
    }

    return;
  } 

  // No win yet so add fresh numbers to the board
  setTimeout(() => {
    writeMatrixToRef(setRandomNumber(unref(matrix), startValue, followUpAmount));
  }, 50);
  
  // It's possible by now that now moves are left
  if (!hasMovesLeft(unref(matrix))) {
    if (confirm('You lost! Start a new game?')) {
      startNewGame();
    }
  }
}
</script>

<template>
  <h1>
    2048
    <button @click="startNewGame">New game</button>
  </h1>
  <div class="grid">
    <template v-for="(row, iRow) in matrix">
      <div
        v-for="(cell, iCell) in row"
        :key="`cell-${iRow}-${iCell}`"
        class="grid-cell"
        :class="`grid-cell--${cell}`"
      >
        {{ cell ? cell : '' }}
      </div>
    </template>
  </div>
</template>
