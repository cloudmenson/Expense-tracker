import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CategoryModel } from "@/models/category";
import { TrashModel } from "@/models/trash";

/* PUT /api/categories/[id] — update a category */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const category = await CategoryModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const result = {
      id: String(category._id),
      name: category.name,
      emoji: category.emoji,
      color: category.color,
      isCustom: category.isCustom,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

/* DELETE /api/categories/[id] — move category to trash */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    const category = await CategoryModel.findByIdAndDelete(id).lean();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    // Move to trash before deleting
    await TrashModel.create({
      type: "category",
      originalId: String(category._id),
      data: {
        name: category.name,
        emoji: category.emoji,
        color: category.color,
        isCustom: category.isCustom,
      },
      deletedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
