"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Define props interface
interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  className?: string; // Allow className prop
}

// Rename component and accept props
export function DatePicker({ selected, onSelect, className }: DatePickerProps) {
  // Remove internal state: const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          // Use passed className and default styles
          className={cn(
            "w-full justify-start text-left font-normal", // Changed w-[240px] to w-full for flexibility
            !selected && "text-muted-foreground",
            className // Apply passed className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" /> {/* Added margin */}
          {/* Use selected prop */}
          {selected ? format(selected, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          // Use props for selected and onSelect
          selected={selected}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
