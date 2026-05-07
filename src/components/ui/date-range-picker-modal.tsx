"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import { uk } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";
import "react-day-picker/style.css";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface DateRangePickerModalProps {
  open: boolean;
  onClose: () => void;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  title?: string;
  numberOfMonths?: number;
}

export function DateRangePickerModal({
  open,
  onClose,
  value,
  onChange,
  title = "Оберіть період",
  numberOfMonths = 1,
}: DateRangePickerModalProps) {
  const pickToday = () => {
    const today = new Date();
    onChange({ from: today, to: today });
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex justify-center">
          <DayPicker
            mode="range"
            selected={value}
            onSelect={onChange}
            locale={uk}
            weekStartsOn={1}
            numberOfMonths={numberOfMonths}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={pickToday}
          className="w-full"
        >
          <CalendarCheck className="h-4 w-4" />
          Сьогодні
        </Button>
      </div>
    </Modal>
  );
}
