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
  const fullDays = Math.floor(totalHours / 24);
  const extraHours = totalHours % 24;

  let weekdayCount = 0;
  let weekendCount = 0;
  let lastDayTypeForExtraHours: "weekday" | "weekend" = "weekday";
  let dayBreakdown: DayBreakdown[] = [];

  let currentDate = new Date(pickupDateTime);
  let totalRent = 0;

  // Check if pickup is after 4pm (pickup day is not charged)
  const pickupHour = pickupDateTime.getHours();
  const isPickupAfter4PM = pickupHour >= 16;
  
  // Check if dropoff is before 4pm (return day is not charged)
  const dropoffHour = dropoffDateTime.getHours();
  const isDropoffBefore4PM = dropoffHour < 16;

  for (let i = 0; i < fullDays; i++) {
    const dayOfWeek = currentDate.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 4;
    
    // Determine if this day should be charged
    let shouldCharge = true;
    let isPickupDay = false;
    let isReturnDay = false;
    let hours = 24;
    let rate = 0;
    let charge = 0;

    // First day (pickup day)
    if (i === 0) {
      isPickupDay = true;
      if (isPickupAfter4PM) {
        // Pickup after 4pm - don't charge for pickup day
        shouldCharge = false;
        hours = 24 - pickupHour;
      } else {
        // Pickup before 4pm - charge for pickup day
        shouldCharge = true;
        hours = 24 - pickupHour;
      }
    }
    // Last day (return day)
    else if (i === fullDays - 1 && extraHours === 0) {
      isReturnDay = true;
      if (isDropoffBefore4PM) {
        // Dropoff before 4pm - don't charge for return day
        shouldCharge = false;
        hours = dropoffHour;
      } else {
        // Dropoff after 4pm - charge for return day
        shouldCharge = true;
        hours = dropoffHour;
      }
    }

    if (shouldCharge) {
      if (isWeekday) {
        weekdayCount++;
        rate = 0; // Will be set by motorcycle price
      } else {
        weekendCount++;
        rate = 0; // Will be set by motorcycle price
      }
    }

    dayBreakdown.push({
      date: currentDate.toDateString(),
      dayName,
      isWeekday,
      isPickupDay,
      isReturnDay,
      hours,
      rate,
      charge,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Handle extra hours on the last day
  if (extraHours > 0) {
    const dayOfExtraHours = currentDate.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfExtraHours];
    const isWeekday = dayOfExtraHours >= 1 && dayOfExtraHours <= 4;
    
    lastDayTypeForExtraHours = isWeekday ? "weekday" : "weekend";
    
    // Check if this is the return day and should be charged
    const shouldChargeReturnDay = !isDropoffBefore4PM;
    
    if (shouldChargeReturnDay) {
      if (isWeekday) {
        weekdayCount++;
      } else {
        weekendCount++;
      }
    }

    dayBreakdown.push({
      date: currentDate.toDateString(),
      dayName,
      isWeekday,
      isPickupDay: false,
      isReturnDay: true,
      hours: extraHours,
      rate: 0, // Will be set by motorcycle price
      charge: 0,
    });
  }

  const days = Math.floor(totalHours / 24);
  const hours = Math.ceil(totalHours % 24);
  const duration = hours > 0 ? `${days} days ${hours} hours` : `${days} days`;

  return {
    totalHours,
    duration,
    weekdayCount,
    weekendCount,
    extraHours,
    lastDayTypeForExtraHours,
    dayBreakdown,
    totalRent,
  };
};

export const calculateRent = (
  bookingPeriod: BookingPeriod,
  weekdayRate: number,
  weekendRate: number
): number => {
  let calculatedRent = 0;
  
  // Calculate weekday charges
  calculatedRent += bookingPeriod.weekdayCount * weekdayRate;
  
  // Calculate weekend charges
  calculatedRent += bookingPeriod.weekendCount * weekendRate;
  
  // Handle extra hours if any
  if (bookingPeriod.extraHours > 0) {
    const extraHourRate = bookingPeriod.lastDayTypeForExtraHours === "weekday" 
      ? weekdayRate 
      : weekendRate;
    
    if (bookingPeriod.extraHours >= 5) {
      // More than 5 hours = charge full additional day
      calculatedRent += extraHourRate;
    } else {
      // Less than 5 hours = charge hourly rate (1/24th of daily rate per hour)
      calculatedRent += Math.ceil((extraHourRate / 24) * bookingPeriod.extraHours);
    }
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

