function binSearchInterval(
  n: number,
  intervals: number[][],
  high: number,
  low: number
): number | undefined {
  if (!intervals || intervals.length === 0) {
    return undefined;
  }

  if (high >= low) {
    const mid = low + Math.floor((high - low) / 2);
    console.log(mid);
    if (intervals[mid]) {
      const [lb, ub] = intervals[mid];

      if (n > ub) {
        return binSearchInterval(n, intervals, high, mid + 1);
      } else if (n < lb) {
        return binSearchInterval(n, intervals, mid - 1, low);
      } else {
        return mid;
      }
    } else {
      return undefined;
    }
  }
}

export default binSearchInterval;
