export type MatrixRow = Array<number>;
export type Matrix = Array<MatrixRow>;

export type MatrixFn = (matrix: Matrix) => Matrix;

export type DirectionMap = {
    'direction': string,
    'keyCodes': string[],
    'preRotate': MatrixFn,
    'postRotate': MatrixFn,
}