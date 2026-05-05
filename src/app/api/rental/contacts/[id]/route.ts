import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ContactModel } from "@/models/contact";

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

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectDB();
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<{
    name: string;
    phone: string;
    photo: string;
    role: string;
    notes: string;
    order: number;
  }>;

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = body.name;
  if (body.phone !== undefined) patch.phone = body.phone;
  if (body.photo !== undefined) patch.photo = body.photo;
  if (body.role !== undefined) patch.role = body.role;
  if (body.notes !== undefined) patch.notes = body.notes;
  if (body.order !== undefined) patch.order = body.order;

  const doc = await ContactModel.findByIdAndUpdate(id, patch, {
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
  await ContactModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
