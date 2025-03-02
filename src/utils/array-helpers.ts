export const map = <T, U>(fn: (item: T) => U, arr: T[]): U[] => arr.map(fn);
export const get = <T>(i: number) => (arr: T[]|T[][]) => arr[i];
export const shallow = <T>(arr: T[]): T[] => [...arr]; // Shallow copy top level of an array
export const reverse = <T>(arr: T[]): T[] => shallow(arr).reverse(); // reverse the top level(rows) in the matrix, not the content of the rows
export const pluck = <S, T extends S[]>(i: number, arr: T[]) => map(get(i), arr); // get value i from all rows in the matrix
export const rangeFrom = ({length}: {length: number}) => [...Array(length).keys()]; // Make an new array with n entries, their value is equal to their index

export const moveZeroesToEnd = (arr: number[]): number[] => {
    const zeros: number[] = [];
    let newArr: number [] = [];
  
    newArr = arr.filter(item => (item !== 0 ? true : zeros.push(item) && false));
  
    return newArr.concat(zeros);
}