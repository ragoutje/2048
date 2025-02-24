import { expect, test } from "vitest";
import { flipMatrix, generateMatrix, hasMovesLeft, hasWinningNumber, isValidMove, mirrorMatrix, moveCells, rotateMatrix, rotateMatrixCounterClockwise, setRandomNumber, shallowCopyMatrix } from "./matrix-helpers";
import { Matrix } from "../types/matrix";

test('shallowCopyMatrix returns a copy matrix where the rows and their values are copied without reference', () => {
    const matrix: Matrix = [[1,2,3],[4,5,6],[7,8,9]];
    const result = shallowCopyMatrix(matrix);

    // Try to create side-effects, which shouldnt be possible with a shallow copy.
    matrix[0][0] = 999;
    matrix[2][1] = 555;

    expect(result[0][0]).to.equal(1);
    expect(result[2][1]).to.equal(8);
});

test('mirrorMatrix flips the row contents horizontally but leaves the rows intact', () => {
    const matrix: Matrix = [[2,4,8],[16,32,64],[128,256,512]];
    const mirroredMatrix = [[8,4,2],[64,32,16],[512,256,128]];
    const result = mirrorMatrix(matrix);

    expect(result).toStrictEqual(mirroredMatrix);
});

test('flipMatrix rotates the matrix 90 degrees clockwise and mirrors the rows', () => {
    // Start:
    // 123
    // 456
    // 789
    const matrix: Matrix = [[1,2,3],[4,5,6],[7,8,9]];

    // Expected:
    // 147
    // 852
    // 369
    const flippedMatrix = [[1,4,7],[2,5,8],[3,6,9]];

    const result = flipMatrix(matrix);

    expect(result).toStrictEqual(flippedMatrix);
});

test('rotateMatrix rotates the matrix 90 degrees clockwise', () => {
    // Start:
    // 123
    // 456
    // 789
    const matrix: Matrix = [[1,2,3],[4,5,6],[7,8,9]];

    // Expected:
    // 741
    // 852
    // 963
    const rotatedMatrix = [[7,4,1],[8,5,2],[9,6,3]];

    const result = rotateMatrix(matrix);

    expect(result).toStrictEqual(rotatedMatrix);
});

test('rotateMatrixCounterClockwise rotates the matrix 90 degrees counter-clockwise', () => {
    // Start:
    // 123
    // 456
    // 789
    const matrix: Matrix = [[1,2,3],[4,5,6],[7,8,9]];

    // Expected:
    // 369
    // 258
    // 147
    const rotatedMatrix = [[3,6,9],[2,5,8],[1,4,7]];

    const result = rotateMatrixCounterClockwise(matrix);

    expect(result).toStrictEqual(rotatedMatrix);
});

test('generateMatrix creates a square matrix of the given size', () => {
    const gridSize = 4;
    const matrix = generateMatrix(gridSize);

    expect(matrix.length).to.equal(gridSize);
    expect(matrix[0].length).to.equal(gridSize);
});

test('setRandomNumber', () => {
    const gridSize = 4;
    const startValue = 2;
    const amount = 1;
    const matrix: Matrix = generateMatrix(gridSize);

    expect(matrix.flat().includes(startValue)).toBe(false);

    const result = setRandomNumber(matrix, startValue, amount);

    expect(result.flat().includes(startValue)).toBe(true);
});

// This requires a lot of scenario's to prevent regressions
test('isValidMove returns true when a move can be made from right to left', () => {
    // Invalid because there are no leading zeroes or adjacent duplicate numbers
    const matrixWithInvalidMove: Matrix = [[2,4,8,16],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    const invalidResult = isValidMove(matrixWithInvalidMove);
    expect(invalidResult).toBe(false);

    // Invalid because there the zero is trailing
    const matrixWithTrailingZero: Matrix = [[2,4,8,0],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    const resultTrailingZero = isValidMove(matrixWithTrailingZero);
    expect(resultTrailingZero).toBe(false);

    // Invalid because there the adjacent duplicate is a trailing zero
    const matrixWithAdjacentTrailingZero: Matrix = [[2,4,0,0],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    const resultAdjacentTrailingZero = isValidMove(matrixWithAdjacentTrailingZero);
    expect(resultAdjacentTrailingZero).toBe(false);

    // Invalid because there the adjacent duplicate is a trailing zero
    const matrixWithThreeTrailingZeroes: Matrix = [[2,0,0,0],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    const resultThreeTrailingZeroes = isValidMove(matrixWithThreeTrailingZeroes);
    expect(resultThreeTrailingZeroes).toBe(false);

    // Valid because there is a leading 0
    const matrixWithLeadingZero: Matrix = [[0,2,4,8],[2,4,8,16],[4,8,16,32],[8,16,32,64]];
    const resultLeadingZero = isValidMove(matrixWithLeadingZero);
    expect(resultLeadingZero).toBe(true);

    // Valid because there is a midway 0
    const matrixWithMidwayZero: Matrix = [[4,2,0,8],[2,4,8,16],[4,8,16,32],[8,16,32,64]];
    const resultMidwayZero = isValidMove(matrixWithMidwayZero);
    expect(resultMidwayZero).toBe(true);

    // Valid because there is an adjacent duplicate which can be merged
    const matrixWithAdjacentDuplicate: Matrix = [[2,2,4,8],[2,4,8,16],[4,8,16,32],[8,16,32,64]];
    const resultAdjacentDuplicate = isValidMove(matrixWithAdjacentDuplicate);
    expect(resultAdjacentDuplicate).toBe(true);

    // Valid because there is an adjacent duplicate which can be merged
    const matrixWithAdjacentDuplicateB: Matrix = [[4,2,4,8],[2,4,16,16],[4,8,16,32],[8,16,32,64]];
    const resultAdjacentDuplicateB = isValidMove(matrixWithAdjacentDuplicateB);
    expect(resultAdjacentDuplicateB).toBe(true);

    // Valid because there is a leading 0
    const matrixWithLeadingAndTrailingZero: Matrix = [[0,2,4,0],[2,4,8,16],[4,8,16,32],[8,16,32,64]];
    const resultLeadingAndTralingZero = isValidMove(matrixWithLeadingAndTrailingZero);
    expect(resultLeadingAndTralingZero).toBe(true);
});

test('hasMovesLeft runs isValidMove on every rotation and returns true if a valid move is present', () => {
    // Up/Down valid move
    // 2,4,8,16
    // 2,4,8,16
    // 2,4,8,16
    // 2,4,8,16
    const matrixA: Matrix = [[2,4,8,16],[2,4,8,16],[2,4,8,16],[2,4,8,16]];
    const resultA = hasMovesLeft(matrixA);
    expect(resultA).toBe(true);

    // Left/Right valid move
    // 2,4,0,0
    // 4,8,16,32
    // 8,16,32,64
    // 16,32,64,128
    const matrixB: Matrix = [[2,4,0,0],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    const resultB = hasMovesLeft(matrixB);
    expect(resultB).toBe(true);

    // Invalid move
    // 2,4,8,16
    // 4,8,16,32
    // 8,16,32,64
    // 16,32,64,128
    const matrixC: Matrix = [[2,4,8,16],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    const resultC = hasMovesLeft(matrixC);
    expect(resultC).toBe(false);
});

test('hasWinningNumber to return true when the given number is present', () => {
    const winningNumber = 2048;
    const winningMatrix: Matrix = [[2,4,8],[16,32,64],[128,256,2048]];
    const winningResult = hasWinningNumber(winningMatrix, winningNumber);

    expect(winningResult).to.equal(true);
    
    const notWinningMatrix: Matrix = [[2,4,8],[16,32,64],[128,256,512]];
    const notWinningResult = hasWinningNumber(notWinningMatrix, winningNumber);
    
    expect(notWinningResult).to.equal(false);
});

test('moveCells moves and merges cells from right to left', () => {
    const matrixA: Matrix = [[0,2,2,8],[2,4,8,16],[2,2,8,16],[2,4,8,16]];
    const expectedResultA = [[4,8,0,0],[2,4,8,16],[4,8,16,0],[2,4,8,16]];
    const resultA = moveCells(matrixA);

    expect(resultA).toStrictEqual(expectedResultA);
    
    const matrixB: Matrix = [[2,4,8,0],[0,2,0,2],[256,256,2,2],[2,4,8,16]];
    const expectedResultB = [[2,4,8,0],[4,0,0,0],[512,4,0,0],[2,4,8,16]];
    const resultB = moveCells(matrixB);

    expect(resultB).toStrictEqual(expectedResultB);
});