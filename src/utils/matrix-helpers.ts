import { DirectionMap, Matrix, MatrixRow } from '../types/matrix';
import { map, shallow, reverse, pluck, rangeFrom, moveZeroesToEnd } from './array-helpers';
import { compose } from './function-helpers';

export const shallowCopyMatrix = (matrix: Matrix): Matrix => map(shallow, shallow(matrix)); // Shallow copy of the rows and row contents in the matrix
export const mirrorMatrix = (matrix: Matrix): Matrix => map(reverse, shallow(matrix)); // Reverse the row contents in the matrix
export const flipMatrix = (matrix: Matrix): Matrix => map((i: number) => pluck(i, matrix) as MatrixRow, rangeFrom(matrix));
export const rotateMatrix = compose(flipMatrix, reverse);
export const rotateMatrixCounterClockwise = compose(reverse, flipMatrix);

export const directionMaps: DirectionMap[] = [
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

export const generateMatrix = (gridSize: number): Matrix => {
    const matrix: Matrix = [];
  
    for (let x = 0; x < gridSize; x++) {
      const indiceY: MatrixRow = [];
  
      for (let y = 0; y < gridSize; y++) {
        indiceY.push(0);
      }
  
      matrix.push(indiceY);
    }
  
    return matrix;
}

export const setRandomNumber = (matrix: Matrix, startValue: number, amount: number): Matrix => {
    const adjustedMatrix = shallowCopyMatrix(matrix);
    let times = 0;
  
    while (times < amount) {  
      const randIRow = Math.floor((Math.random() * adjustedMatrix.length));
      const randICol = Math.floor((Math.random() * adjustedMatrix.length));
  
      // Only add a random number of its cell was previously empty
      if (adjustedMatrix[randIRow][randICol] <= 0) {
        adjustedMatrix[randIRow][randICol] = startValue
        times++;
      }
    }
  
    return adjustedMatrix;
}

export const isValidMove = (matrix: Matrix): boolean =>  shallowCopyMatrix(matrix).some(row => row.some((cell, iCell) => {
    // If there is a leading or midway zero there needs to be a positive value on the right for it to be valid
    if ((iCell < row.length-1 && cell === 0) && row.slice(iCell).reduce((acc, val) => acc + val, 0) > 0) return true;
    
    // adjacent values that are not zero make a valid move
    if (cell !== 0 && cell === row[iCell+1]) return true;
  })
);

export const hasMovesLeft = (matrix: Matrix): boolean => directionMaps.some(map => isValidMove(map.preRotate(shallowCopyMatrix(matrix))));

export const hasWinningNumber = (matrix: Matrix, finishNumber: number): boolean => matrix.flat().includes(finishNumber);

export const moveCells = (matrix: Matrix): Matrix => {
    const newMatrix: Matrix = shallowCopyMatrix(matrix);
  
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