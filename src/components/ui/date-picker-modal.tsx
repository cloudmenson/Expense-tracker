"use client";

import { DayPicker } from "react-day-picker";
import { uk } from "date-fns/locale";
import { parseISO } from "date-fns";
import "react-day-picker/style.css";
import { Modal } from "@/components/ui/modal";

interface DatePickerModalProps {
  open: boolean;
  onClose: () => void;
  /** ISO date string "YYYY-MM-DD" or empty. */
  value?: string;
  onChange: (isoDate: string) => void;
  /** Auto-close after selecting. Default true. */
  closeOnSelect?: boolean;
  title?: string;
}

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function DatePickerModal({
  open,
  onClose,
  value,
  onChange,
  closeOnSelect = true,
  title = "Оберіть дату",
}: DatePickerModalProps) {
  const selected = value ? parseISO(value) : undefined;
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex justify-center">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(fmt(date));
            if (closeOnSelect) onClose();
          }}
          locale={uk}
          weekStartsOn={1}
          defaultMonth={selected}
        />
      </div>
    </Modal>
  );
}
