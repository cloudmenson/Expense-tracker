import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { WishItemModel } from "@/models/wishlist";

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

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  await connectDB();
  const { id } = await ctx.params;
  const body = (await req.json()) as Partial<{
    title: string;
    description: string;
    price: number;
    photo: string;
    link: string;
    status: string;
    order: number;
  }>;

  const patch: Record<string, unknown> = {};
  if (body.title !== undefined) patch.title = body.title;
  if (body.description !== undefined) patch.description = body.description;
  if (body.price !== undefined) patch.price = Number(body.price) || 0;
  if (body.photo !== undefined) patch.photo = body.photo;
  if (body.link !== undefined) patch.link = body.link;
  if (body.status !== undefined && (body.status === "wanted" || body.status === "bought"))
    patch.status = body.status;
  if (body.order !== undefined) patch.order = body.order;

  const doc = await WishItemModel.findByIdAndUpdate(id, patch, {
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
  await WishItemModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
