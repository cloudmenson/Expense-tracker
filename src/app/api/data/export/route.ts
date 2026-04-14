import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { CategoryModel } from "@/models/category";
import { SettingsModel } from "@/models/settings";

/* GET /api/data/export — export all data as JSON */
export async function GET() {
  try {
    await connectDB();

    const [rawExpenses, rawCategories, rawSettings] = await Promise.all([
      ExpenseModel.find().sort({ createdAt: -1 }).lean(),
      CategoryModel.find().lean(),
      SettingsModel.findById("default").lean(),
    ]);

    const expenses = rawExpenses.map((e) => ({
      id: String(e._id),
      title: e.title,
      amount: e.amount,
      categoryId: e.categoryId,
      paidBy: e.paidBy,
      date: e.date,
      note: e.note ?? "",
      emoji: e.emoji ?? "",
      createdAt:
        e.createdAt instanceof Date
          ? e.createdAt.toISOString()
          : String(e.createdAt),
      updatedAt:
        e.updatedAt instanceof Date
          ? e.updatedAt.toISOString()
          : String(e.updatedAt),
    }));

    const categories = rawCategories.map((c) => ({
      id: String(c._id),
      name: c.name,
      emoji: c.emoji,
      color: c.color,
      isCustom: c.isCustom,
    }));

    const settings = rawSettings
      ? {
          currency: rawSettings.currency,
          person1Name: rawSettings.person1Name,
          person2Name: rawSettings.person2Name,
          person1Income:
            typeof rawSettings.person1Income === "number"
              ? rawSettings.person1Income
              : Math.round((rawSettings.monthlyBudget ?? 0) / 2),
          person2Income:
            typeof rawSettings.person2Income === "number"
              ? rawSettings.person2Income
              : (rawSettings.monthlyBudget ?? 0) -
                Math.round((rawSettings.monthlyBudget ?? 0) / 2),
          theme: rawSettings.theme,
          person1Color: rawSettings.person1Color ?? "#e11d48",
          person2Color: rawSettings.person2Color ?? "#3b82f6",
        }
      : null;

    return NextResponse.json({
      expenses,
      categories,
      settings,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/data/export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 },
    );
  }
}
