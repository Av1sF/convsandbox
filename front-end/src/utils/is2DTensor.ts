export function is2DTensor(t: any): t is number[][] {
  return Array.isArray(t) && 
    t.every(row => 
      Array.isArray(row) && 
      row.every(item => typeof item === 'number')
    );
}
