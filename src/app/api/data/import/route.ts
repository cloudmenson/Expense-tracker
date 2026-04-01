import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { CategoryModel } from "@/models/category";
import { SettingsModel } from "@/models/settings";

/* POST /api/data/import — import data from JSON backup */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { expenses, categories, settings } = body;

    // Clear existing data
    await Promise.all([
      ExpenseModel.deleteMany({}),
      CategoryModel.deleteMany({}),
    ]);

    // Import categories
    if (categories && Array.isArray(categories) && categories.length > 0) {
      const catDocs = categories.map(
        (c: {
          id: string;
          name: string;
          emoji: string;
          color: string;
          isCustom: boolean;
        }) => ({
          _id: c.id,
          name: c.name,
          emoji: c.emoji,
          color: c.color,
          isCustom: c.isCustom ?? false,
        }),
      );
      await CategoryModel.insertMany(catDocs);
    }

    // Import expenses
    if (expenses && Array.isArray(expenses) && expenses.length > 0) {
      const expDocs = expenses.map(
        (e: {
          title: string;
          amount: number;
          categoryId: string;
          paidBy: string;
          date: string;
          note?: string;
          emoji?: string;
          createdAt?: string;
          updatedAt?: string;
        }) => ({
          title: e.title,
          amount: e.amount,
          categoryId: e.categoryId,
          paidBy: e.paidBy,
          date: e.date,
          note: e.note ?? "",
          emoji: e.emoji ?? "",
          createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
          updatedAt: e.updatedAt ? new Date(e.updatedAt) : new Date(),
        }),
      );
      await ExpenseModel.insertMany(expDocs);
    }

    // Import settings
    if (settings) {
      await SettingsModel.findByIdAndUpdate("default", settings, {
        upsert: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/data/import error:", error);
    return NextResponse.json(
      { error: "Failed to import data" },
      { status: 500 },
    );
  }
}
