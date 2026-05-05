import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TariffModel } from "@/models/tariff";

const toIso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : new Date().toISOString();

const serialize = (raw: Record<string, unknown>) => ({
  id: String(raw._id),
  kind: String(raw.kind ?? ""),
  pricePerUnit: Number(raw.pricePerUnit ?? 0),
  unitLabel: String(raw.unitLabel ?? ""),
  effectiveFrom: String(raw.effectiveFrom ?? ""),
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
    pricePerUnit: number;
    unitLabel: string;
    effectiveFrom: string;
  }>;

  const patch: Record<string, unknown> = {};
  if (body.pricePerUnit !== undefined)
    patch.pricePerUnit = Number(body.pricePerUnit) || 0;
  if (body.unitLabel !== undefined) patch.unitLabel = body.unitLabel;
  if (body.effectiveFrom !== undefined)
    patch.effectiveFrom = body.effectiveFrom;

  const doc = await TariffModel.findByIdAndUpdate(id, patch, {
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
  await TariffModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
