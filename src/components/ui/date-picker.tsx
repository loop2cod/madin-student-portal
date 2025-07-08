import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export function DatePicker({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  date,
  setDate,
  placeholder = "Select a date",
  onOpenChange,
  dob=true,
  disabled=false,
}:any) {
  const [open, setOpen] = React.useState(false);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const selectedDate = date || new Date();

  const handleMonthChange = (month:any) => {
    setDate(setMonth(selectedDate, months.indexOf(month)));
  };

  const handleYearChange = (year:any) => {
    setDate(setYear(selectedDate, parseInt(year)));
  };

  const handleSelect = (selectedData:any) => {
    if (selectedData) {
      setDate(selectedData);
      setOpen(false); // Close popover when a date is selected
    }
  };

  // Disable future months and years if dob is true
  const currentYear = getYear(new Date());
  const currentMonth = getMonth(new Date());

  const filteredMonths = months;

  const filteredYears = dob
    ? years.filter((year) => year <= currentYear) // Only include years up to the current year
    : years;

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen && onOpenChange) {
        onOpenChange(); // Call the validation function when the calendar opens
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground rounded-none")}
          onClick={() => setOpen((prev) => !prev)}
        >
          <CalendarIcon className={`mr-2 h-4 w-4 ${!date && 'text-gray-500'}`} />
          {date ? format(date, "PPP") : <span className="text-gray-500">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-white rounded-sm" align="start">
        <div className="flex justify-between p-2 gap-2 bg-white">
          <Select onValueChange={handleMonthChange} value={months[getMonth(selectedDate)]}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {filteredMonths.map((month) => {
                return (
                  <SelectItem
                    key={month}
                    value={month}
                  >
                    {month}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select onValueChange={handleYearChange} value={getYear(selectedDate).toString()}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {filteredYears.map((year) => {
                const isDisabled = dob && year > currentYear;
                return (
                  <SelectItem
                    key={year}
                    value={year.toString()}
                    disabled={isDisabled}
                    className={isDisabled ? "text-gray-500 opacity-50" : ""}
                  >
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <Calendar
          className="bg-white"
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          month={selectedDate}
          onMonthChange={setDate}
          disabled={dob ? { after: new Date() } : undefined}
          dob={dob}
        />
      </PopoverContent>
    </Popover>
  );
}