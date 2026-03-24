import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: Array<ClassValue>): string => {
  return twMerge(clsx(inputs));
};

export const formatLineNumber = (
  lineNum: number,
  totalLines: number,
): string => {
  const width: number = totalLines.toString().length;
  return lineNum.toString().padStart(width, ' ');
};