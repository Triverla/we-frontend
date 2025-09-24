"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";

import { cn } from "@woothomes/lib/utils";
import { buttonVariants } from "@woothomes/components/ui/button";

// Interface definitions for days and weekdays
interface Day {
  date: string;
  day: number;
  isRangeEnd?: boolean;
  isRangeStart?: boolean;
  inCurrentMonth: boolean;
  selected: boolean;
  disabled: boolean;
  today: boolean;
}

interface WeekDay {
  day: number;
  dayShort: string;
  dayLong: string;
}

interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | undefined;
  onSelect?: (date: Date | Date[] | undefined) => void;
  disabled?: { from: Date; to: Date } | ((day: Date) => boolean);
  initialFocus?: boolean;
  defaultMonth?: Date;
  numberOfMonths?: number;
  fromDate?: Date;
  toDate?: Date;
  locale?: unknown;
  footer?: React.ReactNode;
  captionLayout?: "dropdown" | "buttons";
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

// Simple calendar implementation without external library dependency
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  mode = "single",
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  // State for the current month and year
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(
    props.defaultMonth ? props.defaultMonth.getMonth() : currentDate.getMonth()
  );
  const [currentYear, setCurrentYear] = React.useState(
    props.defaultMonth
      ? props.defaultMonth.getFullYear()
      : currentDate.getFullYear()
  );

  // State for selected dates
  const [selectedDates, setSelectedDates] = React.useState<string[]>(() => {
    if (!selected) return [];

    if (Array.isArray(selected)) {
      return selected.map((date) => format(date, "yyyy-MM-dd"));
    }

    return [format(selected, "yyyy-MM-dd")];
  });

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week (0-6) for the first day of the month
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate weekdays
  const weekDays: WeekDay[] = React.useMemo(() => {
    const weekStartsOn = props.weekStartsOn || 0;
    const days = [];

    for (let i = 0; i < 7; i++) {
      const dayNumber = (i + weekStartsOn) % 7;
      const date = new Date(2021, 0, 3 + dayNumber); // Jan 3, 2021 was a Sunday

      days.push({
        day: dayNumber,
        dayShort: date
          .toLocaleDateString("en-US", { weekday: "short" })
          .substring(0, 2),
        dayLong: date.toLocaleDateString("en-US", { weekday: "long" }),
      });
    }

    return days;
  }, [props.weekStartsOn]);

  // Generate days for the current month view
  const days = React.useMemo(() => {
    const weekStartsOn = props.weekStartsOn || 0;
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    // Calculate prev month days to show
    const prevMonthDaysToShow = (firstDayOfMonth - weekStartsOn + 7) % 7;
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthDays = getDaysInMonth(prevMonthYear, prevMonth);

    // Calculate next month days to show
    const totalDaysToShow = 42; // 6 rows of 7 days
    const nextMonthDaysToShow =
      totalDaysToShow - daysInMonth - prevMonthDaysToShow;

    const allDays: Day[] = [];

    // Add previous month days
    for (let i = 0; i < prevMonthDaysToShow; i++) {
      const day = prevMonthDays - prevMonthDaysToShow + i + 1;
      const date = new Date(prevMonthYear, prevMonth, day);
      const dateStr = format(date, "yyyy-MM-dd");

      allDays.push({
        date: dateStr,
        day,
        inCurrentMonth: false,
        selected: selectedDates.includes(dateStr),
        disabled: false,
        today: format(new Date(), "yyyy-MM-dd") === dateStr,
      });
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateStr = format(date, "yyyy-MM-dd");

      allDays.push({
        date: dateStr,
        day: i,
        inCurrentMonth: true,
        selected: selectedDates.includes(dateStr),
        disabled: false,
        today: format(new Date(), "yyyy-MM-dd") === dateStr,
      });
    }

    // Add next month days
    for (let i = 1; i <= nextMonthDaysToShow; i++) {
      const date = new Date(
        currentMonth === 11 ? currentYear + 1 : currentYear,
        currentMonth === 11 ? 0 : currentMonth + 1,
        i
      );
      const dateStr = format(date, "yyyy-MM-dd");

      allDays.push({
        date: dateStr,
        day: i,
        inCurrentMonth: false,
        selected: selectedDates.includes(dateStr),
        disabled: false,
        today: format(new Date(), "yyyy-MM-dd") === dateStr,
      });
    }

    // Group days into weeks
    const weeks: Day[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    return weeks;
  }, [currentMonth, currentYear, selectedDates, props.weekStartsOn]);

  // Navigate to previous month
  const previousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Get month name
  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month);
    return date.toLocaleString("default", { month: "long" });
  };

  // Handle date selection
  const handleDateSelect = (dateStr: string) => {
    let newSelectedDates: string[] = [];

    if (mode === "single") {
      newSelectedDates = [dateStr];
    } else if (mode === "multiple") {
      if (selectedDates.includes(dateStr)) {
        newSelectedDates = selectedDates.filter((d) => d !== dateStr);
      } else {
        newSelectedDates = [...selectedDates, dateStr];
      }
    } else if (mode === "range") {
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        newSelectedDates = [dateStr];
      } else {
        newSelectedDates = [selectedDates[0], dateStr].sort();
      }
    }

    setSelectedDates(newSelectedDates);

    if (onSelect) {
      if (mode === "single") {
        const date = parseISO(dateStr);
        if (isValid(date)) {
          onSelect(date);
        }
      } else if (mode === "multiple") {
        // Pass all selected dates as Date[]
        onSelect(newSelectedDates.map(d => parseISO(d)).filter(isValid));
      } else {
        // For range mode, pass as needed (existing logic)
        onSelect(parseISO(dateStr));
      }
    }
  };

  // Helper to check if a day is disabled
  const isDateDisabled = (dateStr: string) => {
    if (!disabled) return false;

    const date = parseISO(dateStr);

    if (typeof disabled === "function") {
      return disabled(date);
    }

    if (disabled.from && disabled.to) {
      const fromDate = disabled.from;
      const toDate = disabled.to;
      return date >= fromDate && date <= toDate;
    }

    return false;
  };

  return (
    <div className={cn("p-3 bg-white border border-gray-200 rounded-xl shadow-md", className)}>
      <div
        className={cn(
          "flex justify-center pt-1 relative items-center w-full",
          classNames?.caption
        )}
      >
        <div className={cn("text-base font-semibold", classNames?.caption_label)}>
          {getMonthName(currentMonth)} {currentYear}
        </div>
        <div className={cn("flex items-center gap-2", classNames?.nav)}>
          <button
            onClick={previousMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "size-8 bg-white border border-gray-300 rounded-full p-0 hover:bg-blue-50 hover:border-blue-400 transition-colors duration-150 flex items-center justify-center shadow-sm absolute left-1",
              classNames?.nav_button,
              classNames?.nav_button_previous
            )}
          >
            <ChevronLeft className={cn("size-5 text-blue-600")} />
            <span className="sr-only">Previous month</span>
          </button>
          <button
            onClick={nextMonth}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "size-8 bg-white border border-gray-300 rounded-full p-0 hover:bg-blue-50 hover:border-blue-400 transition-colors duration-150 flex items-center justify-center shadow-sm absolute right-1",
              classNames?.nav_button,
              classNames?.nav_button_next
            )}
          >
            <ChevronRight className={cn("size-5 text-blue-600")} />
            <span className="sr-only">Next month</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-2">
        <div className={cn("flex border-b border-gray-100 pb-1", classNames?.head_row)}>
          {weekDays.map((weekDay: WeekDay) => (
            <div
              key={weekDay.dayShort}
              className={cn(
                "text-muted-foreground rounded-md w-10 font-semibold text-[0.95rem] text-center",
                classNames?.head_cell
              )}
            >
              {weekDay.dayShort}
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {days.map((week: Day[], weekIndex: number) => (
            <div
              key={weekIndex}
              className={cn("flex w-full mt-2", classNames?.row)}
            >
              {week.map((day: Day) => (
                <div
                  key={day.date}
                  className={cn(
                    "relative p-0 text-center text-base focus-within:relative focus-within:z-20 transition-all duration-150",
                    day.selected && "[&:has([data-selected])]:bg-accent",
                    mode === "range" &&
                      day.selected &&
                      day.isRangeEnd &&
                      "[&:has([data-selected].day-range-end)]:rounded-r-md",
                    mode === "range"
                      ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md"
                      : "[&:has([data-selected])]:rounded-md",
                    classNames?.cell
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleDateSelect(day.date)}
                    disabled={day.disabled || isDateDisabled(day.date)}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "size-10 p-0 font-semibold rounded-lg transition-all duration-150",
                      {
                        "bg-blue-600 text-white font-bold shadow-md border border-blue-700": day.selected,
                        "text-blue-600 border border-blue-300 bg-blue-50 font-bold": day.today && !day.selected,
                        "text-muted-foreground opacity-50 cursor-not-allowed":
                          day.disabled || isDateDisabled(day.date),
                        "bg-gray-100 text-gray-400": !day.inCurrentMonth && showOutsideDays,
                        "hover:bg-blue-100 hover:text-blue-700": !day.selected && !day.disabled && day.inCurrentMonth,
                      },
                      classNames?.day
                    )}
                    data-selected={day.selected ? true : undefined}
                    tabIndex={day.selected || day.today ? 0 : -1}
                  >
                    {day.day}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Calendar };
