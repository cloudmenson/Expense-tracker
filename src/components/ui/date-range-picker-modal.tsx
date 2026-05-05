"use client";

import { DayPicker, type DateRange } from "react-day-picker";
import { uk } from "date-fns/locale";
import "react-day-picker/style.css";
import { Modal } from "@/components/ui/modal";

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
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
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
    </Modal>
  );
}
