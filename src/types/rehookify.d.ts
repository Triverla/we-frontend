declare module '@rehookify/datepicker' {
  export interface Day {
    date: string;
    day: number;
    isRangeEnd?: boolean;
    isRangeStart?: boolean;
    inCurrentMonth: boolean;
    selected: boolean;
    disabled: boolean;
    today: boolean;
    isSelectedStartOfRange?: boolean;
    isSelectedEndOfRange?: boolean;
  }

  export interface WeekDay {
    day: number;
    dayShort: string;
    dayLong: string;
  }

  export interface DatePickerActions {
    setSelectedDate: (date: string) => void;
    setMonth: (month: number) => void;
    setYear: (year: number) => void;
    selectEndOfRange: (date: string) => void;
    selectStartOfRange: (date: string) => void;
  }

  export interface DatePickerResult {
    days: Day[][];
    weekDays: WeekDay[];
    year: number;
    month: number;
    actions: DatePickerActions;
    selectedDates: string[];
  }

  export interface MonthPickerResult {
    monthsMarkup: Record<number, string>;
  }

  export interface DatePickerConfig {
    selectedDates?: string[];
    dates?: {
      mode?: "single" | "range" | "multiple";
      selectedDates?: string[];
      minDate?: string;
      maxDate?: string;
    };
    calendar?: {
      weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    };
    locale?: {
      locale?: unknown;
    }
  }

  export function useDatePicker(config: DatePickerConfig): DatePickerResult;
  export function useMonthPicker(config: { year: number }): MonthPickerResult;
} 