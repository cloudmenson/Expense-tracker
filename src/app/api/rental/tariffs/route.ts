import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TariffModel } from "@/models/tariff";

const FAMILY = "default";

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

export async function GET() {
  await connectDB();
  const docs = await TariffModel.find({ familyId: FAMILY })
    .sort({ kind: 1, effectiveFrom: -1 })
    .lean();
  return NextResponse.json(
    docs.map((d) => serialize(d as Record<string, unknown>)),
  );
}

export async function POST(req: Request) {
  await connectDB();
  const body = (await req.json()) as {
    kind: string;
    pricePerUnit: number;
    unitLabel: string;
    effectiveFrom: string;
  };

  if (!body.kind || !body.unitLabel || !body.effectiveFrom) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const created = await TariffModel.create({
    familyId: FAMILY,
    kind: body.kind,
    pricePerUnit: Number(body.pricePerUnit) || 0,
    unitLabel: body.unitLabel,
    effectiveFrom: body.effectiveFrom,
  });

  return NextResponse.json(
    serialize(created.toObject() as Record<string, unknown>),
  );
}
