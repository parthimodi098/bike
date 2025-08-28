import { Motorcycle } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface DayBreakdown {
  date: string;
  dayName: string;
  isWeekday: boolean;
  isPickupDay: boolean;
  isReturnDay: boolean;
  hours: number;
  rate: number;
  charge: number;
}

export interface BookingPeriod {
  totalHours: number;
  duration: string;
  weekdayCount: number;
  weekendCount: number;
  extraHours: number;
  lastDayTypeForExtraHours: "weekday" | "weekend";
  dayBreakdown: DayBreakdown[];
  totalRent: number;
}

export const getBookingPeriod = (
  pickupDate: Date,
  pickupTime: string,
  dropoffDate: Date,
  dropoffTime: string
): BookingPeriod => {
  const pickupDateTime = new Date(pickupDate);
  const [pickupHours, pickupMinutes] = pickupTime.split(":").map(Number);
  pickupDateTime.setHours(pickupHours, pickupMinutes, 0, 0);

  const dropoffDateTime = new Date(dropoffDate);
  const [dropoffHours, dropoffMinutes] = dropoffTime.split(":").map(Number);
  dropoffDateTime.setHours(dropoffHours, dropoffMinutes, 0, 0);

  const diff = dropoffDateTime.getTime() - pickupDateTime.getTime();

  if (diff <= 0) {
    return {
      totalHours: 0,
      duration: "0 days 0 hours",
      weekdayCount: 0,
      weekendCount: 0,
      extraHours: 0,
      lastDayTypeForExtraHours: "weekday",
      dayBreakdown: [],
      totalRent: 0,
    };
  }

  const totalHours = diff / (1000 * 60 * 60);
  
  // Determine pricing type based on pickup day and time
  const pickupDay = pickupDateTime.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const pickupHour = pickupDateTime.getHours();
  
  // WEEKDAY: Monday 9am to Thursday 3pm (15:00)
  // WEEKEND: Thursday 4pm onwards + Friday + Saturday + Sunday (till 9pm)
  let isWeekendPricing = false;
  
  if (pickupDay === 4 && pickupHour >= 16) { // Thursday 4pm onwards
    isWeekendPricing = true;
  } else if (pickupDay === 5 || pickupDay === 6) { // Friday, Saturday
    isWeekendPricing = true;
  } else if (pickupDay === 0 && pickupHour <= 21) { // Sunday till 9pm
    isWeekendPricing = true;
  }

  let weekdayCount = 0;
  let weekendCount = 0;
  let extraHours = 0;
  let lastDayTypeForExtraHours: "weekday" | "weekend" = "weekday";

  // Calculate full days and extra hours
  const fullDays = Math.floor(totalHours / 24);
  const originalExtraHours = totalHours % 24;

  // For 28+ hours: If there are remaining hours, count as full additional day (more than 1 day + 4hrs)
  // For 24-28 hours: Count only full days (extra hours are charged separately)
  const totalDaysToCharge = (totalHours >= 28 && originalExtraHours > 0) ? fullDays + 1 : fullDays;

  // If single day booking or weekend pricing applies to all days
  if (isWeekendPricing || totalHours <= 24) {
    if (isWeekendPricing) {
      weekendCount = totalDaysToCharge; // Count all days as weekend
      lastDayTypeForExtraHours = "weekend";
    } else {
      weekdayCount = totalDaysToCharge; // Count all days as weekday
      lastDayTypeForExtraHours = "weekday";
    }
  } else {
    // Multi-day booking starting on weekday - combo pricing
    let currentDate = new Date(pickupDateTime);
    
    // Count days based on totalDaysToCharge (not just fullDays)
    for (let i = 0; i < totalDaysToCharge; i++) {
      const dayOfWeek = currentDate.getDay();
      
      // Monday to Thursday = weekday, Friday to Sunday = weekend
      if (dayOfWeek >= 1 && dayOfWeek <= 4) {
        weekdayCount++;
      } else {
        weekendCount++;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // For 24-28 hours, determine type for extra hours
    if (totalHours > 24 && totalHours <= 28 && originalExtraHours > 0) {
      const extraHoursDay = currentDate.getDay();
      lastDayTypeForExtraHours = (extraHoursDay >= 1 && extraHoursDay <= 4) ? "weekday" : "weekend";
    }
  }

  // Set extraHours based on the rules
  if (totalHours >= 28) {
    extraHours = 0; // No extra hours for 28+ hour bookings (more than 1 day + 4hrs)
  } else if (totalHours > 24) {
    extraHours = originalExtraHours; // Preserve extra hours for 24-28 hour bookings
  } else {
    extraHours = 0; // No extra hours for single day bookings
  }

  const days = Math.floor(totalHours / 24);
  const hours = Math.ceil(extraHours);
  const duration = hours > 0 ? `${days} days ${hours} hours` : `${days} days`;

  return {
    totalHours,
    duration,
    weekdayCount,
    weekendCount,
    extraHours,
    lastDayTypeForExtraHours,
    dayBreakdown: [], // Simplified for this logic
    totalRent: 0,
  };
};

export const calculateRent = (
  bookingPeriod: BookingPeriod,
  weekdayRate: number,
  weekendRate: number
): number => {
  let calculatedRent = 0;
  
  // Handle 24-hour cycle billing logic
  if (bookingPeriod.totalHours <= 24) {
    // Single day booking (6-24 hours = 1 day rental)
    if (bookingPeriod.weekdayCount > 0) {
      calculatedRent = weekdayRate;
    } else {
      calculatedRent = weekendRate;
    }
  } else if (bookingPeriod.totalHours < 28) {
    // 24-28 hours: 1 day + extra hours (max 4 hours at 10% per hour)
    const dailyRate = bookingPeriod.weekdayCount > 0 ? weekdayRate : weekendRate;
    calculatedRent = dailyRate;
    
    // Extra hours at 10% of daily rate per hour
    const extraHours = bookingPeriod.totalHours - 24;
    calculatedRent += Math.ceil(extraHours) * (dailyRate * 0.10);
    
  } else {
    // 28+ hours: Move to 2nd day billing - NO EXTRA HOURS, only full days (more than 1 day + 4hrs)
    // The bookingPeriod already has correct weekdayCount and weekendCount for full days
    calculatedRent = bookingPeriod.weekdayCount * weekdayRate + bookingPeriod.weekendCount * weekendRate;
  }
  
  return calculatedRent;
};

export const getFormattedAmount = (amount: number) => {
  return Math.round(amount);
};

export const getTodayPrice = (motorcycle: Motorcycle) => {
  const today = new Date();
  const day = today.getDay();
  if (day >= 1 && day <= 4) return motorcycle.pricePerDayMonThu;
  else return motorcycle.pricePerDayFriSun;
};
