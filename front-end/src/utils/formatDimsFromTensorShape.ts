export function formatDimsFromTensorShape(values: number[]): string {
  // If array has 4 numbers, drop the first.
  if (values.length === 4 && values[0] === 1) {
    values = values.slice(1); // now 3 numbers
  } 

  // If length is 2 → "mxn"
  if (values.length === 2) {
    const [m, n] = values;
    return `${m}x${n}`;
  }

  // Fallback: join with x
  return values.join("x");
}
