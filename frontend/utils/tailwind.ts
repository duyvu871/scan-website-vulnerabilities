import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/*
  Combine multiple class names into one
  @Return:
    string
  @example:
    cn('text-sm', 'text-blue-500', 'bg-red-500')
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
