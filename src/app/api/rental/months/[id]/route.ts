import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { RentMonthModel } from "@/models/rent-month";

const toIso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : new Date().toISOString();

const serialize = (raw: Record<string, unknown>) => ({
  id: String(raw._id),
  month: String(raw.month ?? ""),
  rentAmount: Number(raw.rentAmount ?? 0),
  invoicePhoto: String(raw.invoicePhoto ?? ""),
  charged: Number(raw.charged ?? 0),
  paid: Number(raw.paid ?? 0),
  paidAt: String(raw.paidAt ?? ""),
  readings: Array.isArray(raw.readings)
    ? (raw.readings as Array<Record<string, unknown>>).map((r) => ({
        kind: String(r.kind ?? ""),
        previous: Number(r.previous ?? 0),
        current: Number(r.current ?? 0),
        photo: String(r.photo ?? ""),
      }))
    : [],
  notes: String(raw.notes ?? ""),
  createdAt: toIso(raw.createdAt),
  updatedAt: toIso(raw.updatedAt),
});

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectDB();
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<{
    rentAmount: number;
    invoicePhoto: string;
    charged: number;
    paid: number;
    paidAt: string;
    readings: Array<{
      kind: string;
      previous?: number;
      current?: number;
      photo?: string;
    }>;
    notes: string;
  }>;

  const patch: Record<string, unknown> = {};
  if (body.rentAmount !== undefined)
    patch.rentAmount = Number(body.rentAmount) || 0;
  if (body.invoicePhoto !== undefined) patch.invoicePhoto = body.invoicePhoto;
  if (body.charged !== undefined) patch.charged = Number(body.charged) || 0;
  if (body.paid !== undefined) patch.paid = Number(body.paid) || 0;
  if (body.paidAt !== undefined) patch.paidAt = body.paidAt;
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.readings !== undefined) {
    patch.readings = body.readings.map((r) => ({
      kind: r.kind,
      previous: Number(r.previous) || 0,
      current: Number(r.current) || 0,
      photo: r.photo ?? "",
    }));
  }

  const doc = await RentMonthModel.findByIdAndUpdate(id, patch, {
    new: true,
  }).lean();
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(serialize(doc as Record<string, unknown>));
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectDB();
  const { id } = await ctx.params;
  await RentMonthModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
