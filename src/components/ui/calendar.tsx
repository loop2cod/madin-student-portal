import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

function Calendar({
  className,
  classNames,
  showOutsideDays = true, // Ensure this is enabled
  dob = false, // Add the dob prop
  ...props
}:any) {
  // Disable future dates if dob is true
  const disabledDays = dob ? { after: new Date() } : undefined;

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 bg-white", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-start pt-1 relative items-center",
        caption_label: "text-sm font-medium text-gray-800",
        nav: "space-x-1 flex items-start gap-2",
        nav_button: cn(
          "h-8 w-8 flex items-center justify-center rounded-md border border-gray-300 bg-white hover:bg-gray-100 transition"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-gray-600 rounded-md w-8 font-medium text-xs uppercase tracking-wider"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
          dob && "future-date:text-gray-400 future-date:opacity-50" 
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground border border-blue-500",
        day_outside: cn(
          "text-gray-400 opacity-50" // Muted styling for next/previous month's days
        ),
        day_disabled: "text-gray-400 opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeftIcon className="h-4 w-4 text-gray-600" />,
        IconRight: ({ ...props }) => <ChevronRightIcon className="h-4 w-4 text-gray-600" />,
      }}
      disabled={disabledDays} // Disable future dates if dob is true
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };