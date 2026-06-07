/**
 * Formats a TensorFlow tensor shape as a human-readable dimension string.
 * TF tensors always carry a leading batch dimension of 1 which is meaningless
 * for display, so a 4-element shape `[1, H, W, D]` is trimmed to `H×W×D`.
 */
export function formatDimsFromTensorShape(values: number[]): string {
  // Drop the batch dimension (always 1 in this app).
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
