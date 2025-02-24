import { expect, test } from "vitest";
import { compose } from "./function-helpers";

test('compose create a composed function where fn A calls fn B with argument X', () => {
    const a = (v: number) => v + 2;
    const b = (v: number) => v * 2;
    const x = 5;

    const composedFn = compose(a, b);
    const result = composedFn(x);

    expect(result).to.equal(12)
});