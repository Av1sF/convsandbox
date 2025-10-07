import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  // Given a number of className values, merge and return them
  return twMerge(clsx(...inputs));
}
