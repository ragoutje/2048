export const map = (fn: (...args: unknown[]) => unknown, arr: unknown[]): unknown[] => arr.map(fn); // composable map fn which accepts a fn as first argument
export const get = (i: number): (...args: unknown[]) => unknown => (arr: unknown[]): unknown => arr[i];
export const shallow = (arr: unknown[]): unknown[] => [...arr]; // Shallow copy top level of an array
export const reverse = (arr: unknown[]): unknown[] => shallow(arr).reverse(); // reverse the top level(rows) in the matrix, not the content of the rows
export const pluck = (i: number, matrix: unknown[]) => map(get(i), matrix); // get value i from all rows in the matrix
export const rangeFrom = ({length}: {length: number}): unknown[] => [...Array(length).keys()]; // Make an new array with n entries, their value is equal to their index

export const moveZeroesToEnd = (arr: number[]): number[] => {
    const zeros: number[] = [];
    let newArr: number [] = [];
  
    newArr = arr.filter(item => (item !== 0 ? true : zeros.push(item) && false));
  
    return newArr.concat(zeros);
}