import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(priceInCents: number): string {
  return `€${(priceInCents / 100).toFixed(2)}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('nl-NL');
}
