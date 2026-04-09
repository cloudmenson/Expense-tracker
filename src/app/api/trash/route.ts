import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { TrashModel } from "@/models/trash";

/* GET /api/trash — list all trash items (not yet expired) */
export async function GET() {
  try {
    await connectDB();
    const items = await TrashModel.find().sort({ deletedAt: -1 }).lean();
    return NextResponse.json(
      items.map((item) => ({
        id: String(item._id),
        type: item.type,
        originalId: item.originalId,
        data: item.data,
        deletedAt: item.deletedAt,
      })),
    );
  } catch (error) {
    console.error("GET /api/trash error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trash" },
      { status: 500 },
    );
  }
}

/* DELETE /api/trash — clear all items permanently */
export async function DELETE() {
  try {
    await connectDB();
    await TrashModel.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/trash error:", error);
    return NextResponse.json(
      { error: "Failed to clear trash" },
      { status: 500 },
    );
  }
}
