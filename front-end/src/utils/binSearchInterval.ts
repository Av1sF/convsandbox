function binSearchInterval(
  n: number,
  intervals: number[][],
  high: number,
  low: number
): number | undefined {
  if (!intervals || intervals.length === 0) return undefined;

  if (high >= low) {
    const mid = low + Math.floor((high - low) / 2);
    if (intervals[mid]) {
      const [lb, ub] = intervals[mid];

      if (n > ub) {
        return binSearchInterval(n, intervals, mid + 1, high);
      } else if (n < lb) {
        return binSearchInterval(n, intervals, low, mid - 1);
      } else {
        return mid;
      }
    } else {
      return undefined;
    }
  }
}

export default binSearchInterval;
