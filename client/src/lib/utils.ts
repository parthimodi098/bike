import { Motorcycle } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getBookingPeriod, calculateRent } from "./pricing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export the functions for backward compatibility
export { getBookingPeriod, calculateRent };

export const getFormattedAmount = (amount: number) => {
  return Math.round(amount);
};

export const getTodayPrice = (motorcycle: Motorcycle) => {
  const today = new Date();
  const day = today.getDay();
  if (day >= 1 && day <= 4) return motorcycle.pricePerDayMonThu;
  else return motorcycle.pricePerDayFriSun;
};
