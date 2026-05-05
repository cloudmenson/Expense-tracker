import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactModel } from "@/models/contact";

const FAMILY = "default";

const toIso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : new Date().toISOString();

const serialize = (raw: Record<string, unknown>) => ({
  id: String(raw._id),
  name: String(raw.name ?? ""),
  phone: String(raw.phone ?? ""),
  photo: String(raw.photo ?? ""),
  role: String(raw.role ?? "landlord"),
  notes: String(raw.notes ?? ""),
  order: Number(raw.order ?? 0),
  createdAt: toIso(raw.createdAt),
  updatedAt: toIso(raw.updatedAt),
});

export async function GET() {
  await connectDB();
  const docs = await ContactModel.find({ familyId: FAMILY })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  return NextResponse.json(
    docs.map((d) => serialize(d as Record<string, unknown>)),
  );
}

export async function POST(req: Request) {
  await connectDB();
  const body = (await req.json()) as {
    name?: string;
    phone?: string;
    photo?: string;
    role?: string;
    notes?: string;
    order?: number;
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const last = await ContactModel.findOne({ familyId: FAMILY })
    .sort({ order: -1 })
    .lean();
  const nextOrder = last
    ? Number((last as { order?: number }).order ?? 0) + 1
    : 0;

  const created = await ContactModel.create({
    familyId: FAMILY,
    name: body.name.trim(),
    phone: body.phone ?? "",
    photo: body.photo ?? "",
    role: body.role ?? "landlord",
    notes: body.notes ?? "",
    order: body.order ?? nextOrder,
  });

  return NextResponse.json(
    serialize(created.toObject() as Record<string, unknown>),
  );
}
