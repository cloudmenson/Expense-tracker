"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ensureJpegDataUri } from "@/lib/photo";
import type { RentMonth } from "@/types/rental";

interface Props {
  month: RentMonth;
  className?: string;
  variant?: "primary" | "secondary";
}

export function MonthExportButton({
  month,
  className,
  variant = "secondary",
}: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const monthForPdf = {
        ...month,
        readings: await Promise.all(
          month.readings.map(async (r) => ({
            ...r,
            photo: await ensureJpegDataUri(r.photo),
          })),
        ),
        invoicePhoto: await ensureJpegDataUri(month.invoicePhoto),
      };

      const [{ pdf }, { MonthReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./month-report-pdf"),
      ]);
      const blob = await pdf(
        <MonthReportDocument month={monthForPdf} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rental-${month.month}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleExport}
      disabled={exporting}
      className={className}
      aria-label="Експортувати PDF"
    >
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      PDF
    </Button>
  );
}
