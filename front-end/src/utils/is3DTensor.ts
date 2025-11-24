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