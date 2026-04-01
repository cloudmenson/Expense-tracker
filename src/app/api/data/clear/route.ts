import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { CategoryModel } from "@/models/category";
import { SettingsModel } from "@/models/settings";
import { DEFAULT_CATEGORIES } from "@/lib/categories";

/* POST /api/data/clear — clear all data and re-seed defaults */
export async function POST() {
  try {
    await connectDB();

    // Clear everything
    await Promise.all([
      ExpenseModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      SettingsModel.deleteMany({}),
    ]);

    // Re-seed default categories
    const catDocs = DEFAULT_CATEGORIES.map((c) => ({
      _id: c.id,
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      isCustom: c.isCustom,
    }));
    await CategoryModel.insertMany(catDocs);

    // Re-seed default settings
    await SettingsModel.create({
      _id: "default",
      currency: "$",
      person1Name: "Партнёр 1",
      person2Name: "Партнёр 2",
      monthlyBudget: 5000,
      theme: "system",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/data/clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear data" },
      { status: 500 },
    );
  }
}
