"use client";

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { format, isSameDay } from "date-fns";
import { MapPinIcon, CalendarIcon, ClockIcon, SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import { SearchRidesFormData, searchRidesSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMotorcycleStore } from "@/store/motorcycle-store";
import TimePickerPopover from "./select-time";

const getInitialTimes = () => {
  const now = new Date();
  let pickupDate = new Date();
  pickupDate.setHours(0, 0, 0, 0);
  let pickupHour = now.getHours() + 1;

  if (pickupHour >= 21) {
    pickupHour = 9;
    pickupDate.setDate(pickupDate.getDate() + 1);
  }

  if (pickupHour < 9) {
    pickupHour = 9;
  }
  const pickupTime = `${String(pickupHour).padStart(2, "0")}:00`;

  // Set dropoff for same day with 6-hour minimum
  let dropoffHour = pickupHour + 6;
  let dropoffDate = new Date(pickupDate);
  
  // If 6 hours later goes past 22:00, move to next day
  if (dropoffHour > 22) {
    dropoffDate.setDate(dropoffDate.getDate() + 1);
    dropoffHour = Math.min(dropoffHour, 22); // Cap at 22:00 if staying same day, otherwise can be any time next day
  }
  
  const dropoffTime = `${String(dropoffHour).padStart(2, "0")}:00`;

  return {
    pickupDate,
    dropoffDate,
    pickupTime,
    dropoffTime,
  };
};

function SearchRides() {
  const {
    setPickupDate,
    setDropoffDate,
    setPickupTime,
    setDropoffTime,
    setPickupLocation,
    setDropoffLocation,
    pickupLocation,
  } = useCartStore();

  const [pickupDateOpen, setPickupDateOpen] = useState(false);
  const [dropoffDateOpen, setDropoffDateOpen] = useState(false);
  const [pickupTimeOpen, setPickupTimeOpen] = useState(false);
  const [dropoffTimeOpen, setDropoffTimeOpen] = useState(false);

  const form = useForm<SearchRidesFormData>({
    resolver: zodResolver(searchRidesSchema),
    defaultValues: {
      pickupLocation: pickupLocation || "",
      dropoffLocation: pickupLocation || "",
      ...getInitialTimes(),
    },
  });

  const watchedPickupDate = form.watch("pickupDate");
  const watchedDropoffDate = form.watch("dropoffDate");
  const watchedPickupTime = form.watch("pickupTime");
  const watchedDropoffTime = form.watch("dropoffTime");

  useEffect(() => {
    const { pickupDate, dropoffDate, pickupTime, dropoffTime } = form.getValues();

    if (!pickupDate || !pickupTime) {
      return;
    }

    // If no dropoff date is set, set it to pickup date (allow same-day)
    if (!dropoffDate) {
      form.setValue("dropoffDate", new Date(pickupDate));
      return;
    }

    // Ensure dropoff date is not before pickup date
    const currentDropoffDate = new Date(dropoffDate);
    currentDropoffDate.setHours(0, 0, 0, 0);
    const currentPickupDate = new Date(pickupDate);
    currentPickupDate.setHours(0, 0, 0, 0);

    if (currentDropoffDate < currentPickupDate) {
      form.setValue("dropoffDate", new Date(pickupDate));
      return;
    }

    // Handle time validation for same-day bookings (minimum 6 hours)
    if (!dropoffTime) {
      return;
    }

    // Check if it's same day booking
    const isSameDayBooking = isSameDay(pickupDate, dropoffDate);
    
    if (isSameDayBooking) {
      const [pickupHour, pickupMinute] = pickupTime.split(":").map(Number);
      const [dropoffHour, dropoffMinute] = dropoffTime.split(":").map(Number);
      
      const pickupMinutes = pickupHour * 60 + pickupMinute;
      const dropoffMinutes = dropoffHour * 60 + dropoffMinute;
      
      // Check if dropoff is at least 6 hours after pickup
      const minimumDropoffMinutes = pickupMinutes + (6 * 60); // 6 hours = 360 minutes
      
      if (dropoffMinutes < minimumDropoffMinutes) {
        // If minimum dropoff time exceeds 22:00 (22 * 60 = 1320 minutes), move to next day
        if (minimumDropoffMinutes > 22 * 60) {
          const nextDay = new Date(pickupDate);
          nextDay.setDate(pickupDate.getDate() + 1);
          form.setValue("dropoffDate", nextDay);
          
          // Set a reasonable time for next day (could be the overflow time or a default like 09:00)
          const overflowMinutes = minimumDropoffMinutes - (24 * 60);
          if (overflowMinutes > 0) {
            const overflowHours = Math.floor(overflowMinutes / 60);
            const remainingMinutes = overflowMinutes % 60;
            const newDropoffTime = `${overflowHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
            form.setValue("dropoffTime", newDropoffTime);
          } else {
            // Set to a reasonable morning time if no overflow
            form.setValue("dropoffTime", "09:00");
          }
        } else {
          // Set minimum dropoff time on same day
          const minHours = Math.floor(minimumDropoffMinutes / 60);
          const minMinutes = minimumDropoffMinutes % 60;
          const newDropoffTime = `${minHours.toString().padStart(2, '0')}:${minMinutes.toString().padStart(2, '0')}`;
          form.setValue("dropoffTime", newDropoffTime);
        }
      }
    }
    // For different day bookings, no time restrictions apply
  }, [watchedPickupDate, watchedDropoffDate, watchedPickupTime, watchedDropoffTime, form]);

  const { filters } = useMotorcycleStore();
  const branches = filters.distinctCities;
  const router = useRouter();

  const onSubmit = (data: SearchRidesFormData) => {
    setPickupDate(data.pickupDate);
    setDropoffDate(data.dropoffDate);
    setPickupTime(data.pickupTime);
    setDropoffTime(data.dropoffTime);
    setPickupLocation(data.pickupLocation || "");
    setDropoffLocation(data.pickupLocation || "");
    router.push(`/motorcycles?location=${data.pickupLocation}`);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-6xl mx-auto bg-white dark:bg-[#18181B] border-gray-200 dark:border-gray-700 shadow">
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Pickup Location */}
                  <FormField
                    name="pickupLocation"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="space-y-2 grid grid-rows-2">
                        <FormLabel className="dark:text-white">
                          <MapPinIcon className="inline h-4 w-4 mr-1 text-yellow-primary" />
                          Pick Up Location
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("dropoffLocation", value);
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full bg-white text-muted-foreground border-yellow-primary/30 focus:border-yellow-primary focus:ring-yellow-primary/20">
                              <SelectValue placeholder="Select Pickup location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Pickup Date */}
                  <FormField
                    name="pickupDate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="space-y-2 grid grid-rows-2">
                        <FormLabel className="dark:text-white">
                          <CalendarIcon className="inline h-4 w-4 mr-1 text-yellow-primary" />
                          Pick Up Date
                        </FormLabel>
                        <Popover
                          open={pickupDateOpen}
                          onOpenChange={setPickupDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal border-yellow-primary/30 ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value
                                  ? format(
                                      new Date(field.value),
                                      "MMM dd, yyyy"
                                    )
                                  : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                if (date) {
                                  // Allow same-day booking, but if current dropoff is before pickup, set to same day
                                  const currentDropoff = form.getValues("dropoffDate");
                                  if (!currentDropoff || currentDropoff < date) {
                                    form.setValue("dropoffDate", new Date(date));
                                  }
                                }
                                setPickupDateOpen(false);
                              }}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  {/* Pickup Time */}
                  <FormField
                    name="pickupTime"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="space-y-2 grid grid-rows-2">
                        <FormLabel className="dark:text-white">
                          <ClockIcon className="inline h-4 w-4 mr-1 text-yellow-primary" />
                          Pick Up Time
                        </FormLabel>
                        <TimePickerPopover
                          field={field}
                          isOpen={pickupTimeOpen}
                          setIsOpen={setPickupTimeOpen}
                          placeholder="Select pickup time"
                          pickupDate={watchedPickupDate}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Drop Off Location */}
                  <FormField
                    name="dropoffLocation"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="space-y-2 grid grid-rows-2">
                        <FormLabel className="dark:text-white">
                          <MapPinIcon className="inline h-4 w-4 mr-1 text-yellow-primary" />
                          Drop Off Location
                        </FormLabel>
                        <Select value={field.value} disabled>
                          <FormControl>
                            <SelectTrigger className="w-full bg-white text-muted-foreground border-yellow-primary/30 focus:border-yellow-primary focus:ring-yellow-primary/20">
                              <SelectValue placeholder="Same as Pickup location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {branches.map((loc) => (
                              <SelectItem key={loc} value={loc}>
                                {loc}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  {/* Drop Off Date */}
                  <FormField
                    name="dropoffDate"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="space-y-2 grid grid-rows-2">
                        <FormLabel className="dark:text-white">
                          <CalendarIcon className="inline h-4 w-4 mr-1 text-yellow-primary" />
                          Drop Off Date
                        </FormLabel>
                        <Popover
                          open={dropoffDateOpen}
                          onOpenChange={setDropoffDateOpen}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal border-yellow-primary/30 ${
                                  !field.value && "text-muted-foreground"
                                }`}
                              >
                                {field.value
                                  ? format(
                                      new Date(field.value),
                                      "MMM dd, yyyy"
                                    )
                                  : "Select date"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(date) => {
                                field.onChange(date);
                                setDropoffDateOpen(false);
                              }}
                              disabled={(date) => {
                                // Allow same day booking - just disable dates before pickup date
                                const minDate = new Date(watchedPickupDate);
                                minDate.setHours(0, 0, 0, 0);
                                return date < minDate;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  {/* Drop Off Time */}
                  <FormField
                    name="dropoffTime"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="space-y-2 grid grid-rows-2">
                        <FormLabel className="dark:text-white">
                          <ClockIcon className="inline h-4 w-4 mr-1 text-yellow-primary" />
                          Drop Off Time
                        </FormLabel>
                        <TimePickerPopover
                          field={field}
                          isOpen={dropoffTimeOpen}
                          setIsOpen={setDropoffTimeOpen}
                          placeholder="Select dropoff time"
                          isDropoff={true}
                          pickupDate={watchedPickupDate}
                          dropoffDate={watchedDropoffDate}
                          pickupTime={watchedPickupTime}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="mt-8 text-center">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-yellow-primary cursor-pointer text-white px-12 py-4 text-md shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <SearchIcon className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
export default SearchRides;