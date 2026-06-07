/**
 * Binary-searches a sorted array of `[lb, ub]` intervals for the one that
 * contains `n`, returning its index. Returns `undefined` if no interval matches.
 * Called with `high = intervals.length - 1, low = 0`.
 */
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
