/** Returns `true` when `t` is a non-empty 2-D array of numbers (`number[][]`). */
export function is2DTensor(t: any): t is number[][] {
  return Array.isArray(t) && 
    t.every(row => 
      Array.isArray(row) && 
      row.every(item => typeof item === 'number')
    );
}
