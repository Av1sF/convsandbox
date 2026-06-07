/** Returns the ordinal string for `n` (e.g. 1 → "1st", 12 → "12th"). */
export function ordinal(n: number) {
  const mod100 = n % 100;
  // 11–13 are always "th" regardless of last digit (11th, 12th, 13th not 11st/12nd/13rd).
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;

  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}