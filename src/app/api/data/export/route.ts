import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { CategoryModel } from "@/models/category";
import { SettingsModel } from "@/models/settings";
import { ProfileModel } from "@/models/profile";

/* GET /api/data/export — export all data as JSON */
export async function GET() {
  try {
    await connectDB();

    const [rawExpenses, rawCategories, rawSettings, rawProfiles] =
      await Promise.all([
        ExpenseModel.find().sort({ createdAt: -1 }).lean(),
        CategoryModel.find().lean(),
        SettingsModel.findById("default").lean(),
        ProfileModel.find({ familyId: "default" })
          .sort({ createdAt: 1 })
          .lean(),
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
          theme: rawSettings.theme,
        }
      : null;

    const profiles = rawProfiles.map((p) => ({
      id: String(p._id),
      familyId: p.familyId,
      name: p.name,
      color: p.color,
      monthlyIncome: p.monthlyIncome,
      role: p.role,
      status: p.status,
      inviteEmail: p.inviteEmail,
      avatarEmoji: p.avatarEmoji,
      avatarImage: p.avatarImage,
      createdAt:
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : String(p.createdAt),
      updatedAt:
        p.updatedAt instanceof Date
          ? p.updatedAt.toISOString()
          : String(p.updatedAt),
    }));

    return NextResponse.json({
      expenses,
      categories,
      settings,
      profiles,
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
