/**
 * Returns `true` when `t` is at least a 3-D nested array.
 * Only checks two levels of nesting — does not verify that leaf values are
 * numbers. Sufficient for the D3 draw utilities that destructure tensor dims.
 */
export function is3DTensor(t: any): t is number[][][][] {
  return (
    Array.isArray(t) &&
    t.every(
      a =>
        Array.isArray(a) &&
        a.every(b => Array.isArray(b))
    )
  );
}