import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactModel } from "@/models/contact";
import { RentMonthModel } from "@/models/rent-month";

const FAMILY = "default";

const toIso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : new Date().toISOString();

export async function GET() {
  await connectDB();

  const [contactDocs, monthDocs] = await Promise.all([
    ContactModel.find({ familyId: FAMILY })
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    RentMonthModel.find({ familyId: FAMILY }).sort({ month: -1 }).lean(),
  ]);

  const contacts = contactDocs.map((c) => {
    const raw = c as Record<string, unknown>;
    return {
      id: String(raw._id),
      name: String(raw.name ?? ""),
      phone: String(raw.phone ?? ""),
      photo: String(raw.photo ?? ""),
      role: String(raw.role ?? "landlord"),
      notes: String(raw.notes ?? ""),
      order: Number(raw.order ?? 0),
      createdAt: toIso(raw.createdAt),
      updatedAt: toIso(raw.updatedAt),
    };
  });

  const months = monthDocs.map((m) => {
    const raw = m as Record<string, unknown>;
    return {
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
    };
  });

  return NextResponse.json({ contacts, months });
}
