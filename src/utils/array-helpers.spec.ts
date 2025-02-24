import { expect, test } from "vitest";
import { get, map, moveZeroesToEnd, pluck, rangeFrom, reverse, shallow } from "./array-helpers";
import { generateMatrix } from "./matrix-helpers";

test('map iterates over an array and performs the given function on each value', () => {
    const arr = [1,2,3];
    const testFn = (v: number): number => v * 2;
    const result = map(testFn, arr);

    expect(result[0]).to.equal(2);
    expect(result[1]).to.equal(4);
    expect(result[2]).to.equal(6);
});

test('get returns a prepared fn that returns the given index', () => {
    const arr = ['a','b','c'];
    const preparedFn = get(1);
    const result = preparedFn(arr);
    
    expect(result).to.equal('b');
});

test('shallow creates a new array without references in the top level', () => {
    const arr = ['a', 'b', 'c'];
    const result = shallow(arr);
    expect(result).toStrictEqual(arr);

    // Try to create side-effects, which shouldnt be possible with a shallow copy.
    arr[0] = 'new';

    expect(result[0]).to.equal('a');
});

test('reverse changes the order of rows, not the content of rows', () => {
    const matrix = [
        ['row0A','row0B'],
        ['row1A','row1A'],
        ['row2A','row2B'],
    ]
    const result = reverse(matrix);

    expect(result[0][0]).to.equal('row2A');
    expect(result[0][1]).to.equal('row2B');
});

test('pluck picks the correct values from matrix rows', () => {
    const gridSize = 4;
    const indexToPluck = 3;

    const newMatrix = generateMatrix(gridSize);
    newMatrix[0][indexToPluck] = 5;
    newMatrix[1][indexToPluck] = 33;
    newMatrix[2][indexToPluck] = 22;
    newMatrix[3][indexToPluck] = 100;

    const pluckResult = pluck(indexToPluck, newMatrix);

    expect(pluckResult).toStrictEqual([5,33,22,100]);
});

test('rangeFrom has the correct length', () => {
    const arrayLength = 3;
    const arrayWithThreeLength = rangeFrom({'length': arrayLength});

    expect(arrayWithThreeLength.length).to.equal(arrayLength);
});
test('rangeFrom creates an array with strings', () => {
    const arrayLength = 5;
    const arrayWithThreeLength = rangeFrom({'length': arrayLength});

    expect(typeof arrayWithThreeLength).to.equal('object');
});

test('moveZeroesToEnd places all zeroes at the end of the array', () => {
    const arr = [0,1,2,3];
    const result = moveZeroesToEnd(arr);

    expect(result[3]).to.equal(0);
    expect(result).toStrictEqual([1,2,3,0]);
});