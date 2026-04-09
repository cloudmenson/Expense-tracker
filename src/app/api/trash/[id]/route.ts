import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { TrashModel } from "@/models/trash";
import { ExpenseModel } from "@/models/expense";
import { CategoryModel } from "@/models/category";

/* DELETE /api/trash/[id] — permanently delete one item */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();
    await TrashModel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/trash/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete from trash" },
      { status: 500 },
    );
  }
}

/* POST /api/trash/[id]/restore is handled below via action in body */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    const item = await TrashModel.findById(id).lean();
    if (!item) {
      return NextResponse.json(
        { error: "Trash item not found" },
        { status: 404 },
      );
    }

    const data = item.data as Record<string, unknown>;

    if (item.type === "expense") {
      const { id: _id, ...rest } = data as Record<string, unknown>;
      void _id;
      const expenseData = {
        ...rest,
        _id: new mongoose.Types.ObjectId(item.originalId),
      };
      await ExpenseModel.create(expenseData);
    } else if (item.type === "category") {
      const { id: _id, ...rest } = data as Record<string, unknown>;
      void _id;
      const categoryData = { ...rest, _id: item.originalId };
      await CategoryModel.create(categoryData);
    }

    await TrashModel.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/trash/[id] (restore) error:", error);
    return NextResponse.json(
      { error: "Failed to restore item" },
      { status: 500 },
    );
  }
}
