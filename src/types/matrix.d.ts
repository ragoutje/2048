export type MatrixRow = Array<number>;
export type Matrix = Array<MatrixRow>;

export type DirectionMap = {
    'direction': string,
    'keyCodes': string[],
    'preRotate': (...args: unknown[]) => unknown,
    'postRotate': (...args: unknown[]) => unknown,
}