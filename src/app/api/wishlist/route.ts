import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { WishItemModel } from "@/models/wishlist";

const FAMILY = "default";

const toIso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : new Date().toISOString();

const serialize = (raw: Record<string, unknown>) => ({
  id: String(raw._id),
  title: String(raw.title ?? ""),
  description: String(raw.description ?? ""),
  price: Number(raw.price ?? 0),
  photo: String(raw.photo ?? ""),
  link: String(raw.link ?? ""),
  status: String(raw.status ?? "wanted"),
  order: Number(raw.order ?? 0),
  createdAt: toIso(raw.createdAt),
  updatedAt: toIso(raw.updatedAt),
});

export async function GET() {
  await connectDB();
  const docs = await WishItemModel.find({ familyId: FAMILY })
    .sort({ order: 1, createdAt: -1 })
    .lean();
  return NextResponse.json(
    docs.map((d) => serialize(d as Record<string, unknown>)),
  );
}

export async function POST(req: Request) {
  await connectDB();
  const body = (await req.json()) as {
    title?: string;
    description?: string;
    price?: number;
    photo?: string;
    link?: string;
    status?: string;
    order?: number;
  };

  if (!body.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const last = await WishItemModel.findOne({ familyId: FAMILY })
    .sort({ order: -1 })
    .lean();
  const nextOrder = last
    ? Number((last as { order?: number }).order ?? 0) + 1
    : 0;

  const created = await WishItemModel.create({
    familyId: FAMILY,
    title: body.title.trim(),
    description: body.description ?? "",
    price: Number(body.price) || 0,
    photo: body.photo ?? "",
    link: body.link ?? "",
    status:
      body.status === "bought" || body.status === "wanted"
        ? body.status
        : "wanted",
    order: body.order ?? nextOrder,
  });

  return NextResponse.json(
    serialize(created.toObject() as Record<string, unknown>),
  );
}
