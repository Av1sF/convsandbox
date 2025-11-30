function binSearchInterval(
  n: number,
  intervals: number[][]
): number[] | undefined {
  if (!intervals || intervals.length === 0) return undefined;

  const mid = Math.floor(intervals.length / 2);
  const [low, high] = intervals[mid];

  if (n > high) {
    return binSearchInterval(n, intervals.slice(mid + 1));
  } else if (n < low) {
    return binSearchInterval(n, intervals.slice(0, mid));
  } else {
    return intervals[mid];
  }
}

export default binSearchInterval;
