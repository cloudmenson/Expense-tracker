"use client";

import { useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  /** Body content. Use ReactNode to embed emoji / strong / amounts. */
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual tone of the confirm button. */
  tone?: "danger" | "primary";
  /** External "busy" flag (e.g., store mutation lock). Disables buttons + shows spinner. */
  busy?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Видалити",
  cancelLabel = "Скасувати",
  tone = "danger",
  busy: externalBusy = false,
}: ConfirmModalProps) {
  const [internalBusy, setInternalBusy] = useState(false);
  const busy = externalBusy || internalBusy;

  const handleConfirm = async () => {
    setInternalBusy(true);
    try {
      await onConfirm();
    } finally {
      setInternalBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {description && (
        <div className="mb-6 text-sm text-foreground/65">{description}</div>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={busy}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={busy}
          style={
            tone === "danger"
              ? {
                  background:
                    "linear-gradient(140deg, #f47272 0%, #e54860 60%, #c11f3a 100%)",
                  color: "#fff",
                  boxShadow:
                    "0 6px 16px rgba(225, 29, 72, 0.32), inset 0 1px 0 rgba(255,255,255,0.22)",
                }
              : undefined
          }
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {busy ? "Зачекайте…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
