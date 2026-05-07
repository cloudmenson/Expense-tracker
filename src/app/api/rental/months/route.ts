import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { RentMonthModel } from "@/models/rent-month";

const FAMILY = "default";

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

export async function GET() {
  await connectDB();
  const docs = await RentMonthModel.find({ familyId: FAMILY })
    .sort({ month: -1 })
    .lean();
  return NextResponse.json(
    docs.map((d) => serialize(d as Record<string, unknown>)),
  );
}

export async function POST(req: Request) {
  await connectDB();
  const body = (await req.json()) as {
    month: string;
    rentAmount?: number;
    invoicePhoto?: string;
    charged?: number;
    paid?: number;
    paidAt?: string;
    readings?: Array<{
      kind: string;
      previous?: number;
      current?: number;
      photo?: string;
    }>;
    notes?: string;
  };

  if (!body.month || !/^\d{4}-\d{2}$/.test(body.month)) {
    return NextResponse.json(
      { error: "Invalid month (expected YYYY-MM)" },
      { status: 400 },
    );
  }

  const existing = await RentMonthModel.findOne({
    familyId: FAMILY,
    month: body.month,
  }).lean();
  if (existing) {
    return NextResponse.json(
      { error: "Month already exists", id: String((existing as { _id: unknown })._id) },
      { status: 409 },
    );
  }

  // If the caller didn't supply readings, seed them from the most recent
  // month preceding this one: previous = that month's current, current = 0.
  // This way the new month always knows where the meter "started" without
  // making the user re-type the old number.
  let readings = (body.readings ?? []).map((r) => ({
    kind: r.kind,
    previous: Number(r.previous) || 0,
    current: Number(r.current) || 0,
    photo: r.photo ?? "",
  }));

  if (readings.length === 0) {
    const prevDoc = (await RentMonthModel.findOne({
      familyId: FAMILY,
      month: { $lt: body.month },
    })
      .sort({ month: -1 })
      .lean()) as { readings?: Array<Record<string, unknown>> } | null;

    if (prevDoc?.readings?.length) {
      readings = prevDoc.readings.map((r) => ({
        kind: String(r.kind ?? ""),
        previous: Number(r.current ?? 0),
        current: 0,
        photo: "",
      }));
    }
  }

  const created = await RentMonthModel.create({
    familyId: FAMILY,
    month: body.month,
    rentAmount: Number(body.rentAmount) || 0,
    invoicePhoto: body.invoicePhoto ?? "",
    charged: Number(body.charged) || 0,
    paid: Number(body.paid) || 0,
    paidAt: body.paidAt ?? "",
    readings,
    notes: body.notes ?? "",
  });

  return NextResponse.json(
    serialize(created.toObject() as Record<string, unknown>),
  );
}
