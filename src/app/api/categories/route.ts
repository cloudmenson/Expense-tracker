import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CategoryModel } from "@/models/category";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

const categoryProjection = {
  name: 1,
  emoji: 1,
  color: 1,
  isCustom: 1,
} as const;

/* GET /api/categories — list all categories (auto-seed defaults if empty) */
export async function GET() {
  try {
    await connectDB();

    let categories = await CategoryModel.find()
      .select(categoryProjection)
      .lean();

    // Auto-seed defaults on first run
    if (categories.length === 0) {
      const docs = DEFAULT_CATEGORIES.map((c) => ({
        _id: c.id,
        name: c.name,
        emoji: c.emoji,
        color: c.color,
        isCustom: c.isCustom,
      }));
      await CategoryModel.insertMany(docs);
      categories = await CategoryModel.find().select(categoryProjection).lean();
    }

    const result = categories.map((c) => ({
      id: String(c._id),
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      isCustom: c.isCustom,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}

/* POST /api/categories — create a new category */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const id = body.id ?? `custom-${Date.now()}`;

    const category = await CategoryModel.create({
      _id: id,
      name: body.name,
      emoji: body.emoji,
      color: body.color,
      isCustom: body.isCustom ?? true,
    });

    const result = {
      id: String(category._id),
      name: category.name,
      emoji: category.emoji,
      color: category.color,
      isCustom: category.isCustom,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
