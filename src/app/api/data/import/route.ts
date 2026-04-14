import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { CategoryModel } from "@/models/category";
import { SettingsModel } from "@/models/settings";
import { ProfileModel } from "@/models/profile";

/* POST /api/data/import — import data from JSON backup */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const { expenses, categories, settings, profiles } = body;

    // Clear existing data
    await Promise.all([
      ExpenseModel.deleteMany({}),
      CategoryModel.deleteMany({}),
      ProfileModel.deleteMany({}),
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

    // Import settings (only currency + theme; person* data lives in profiles)
    if (settings && typeof settings === "object") {
      const patch: Record<string, unknown> = {};
      if (settings.currency) patch.currency = settings.currency;
      if (settings.theme) patch.theme = settings.theme;
      if (Object.keys(patch).length > 0) {
        await SettingsModel.findByIdAndUpdate("default", patch, {
          upsert: true,
        });
      }
    }

    if (profiles && Array.isArray(profiles) && profiles.length > 0) {
      const profileDocs = profiles.map(
        (p: {
          id: string;
          familyId?: string;
          name: string;
          color?: string;
          monthlyIncome?: number;
          role?: "owner" | "member";
          status?: "active" | "invited";
          inviteEmail?: string;
          avatarEmoji?: string;
          avatarImage?: string;
          createdAt?: string;
          updatedAt?: string;
        }) => ({
          _id: p.id,
          familyId: p.familyId ?? "default",
          name: p.name,
          color: p.color ?? "#e11d48",
          monthlyIncome: p.monthlyIncome ?? 0,
          role: p.role ?? "member",
          status: p.status ?? "active",
          inviteEmail: p.inviteEmail,
          avatarEmoji: p.avatarEmoji ?? "👤",
          avatarImage: p.avatarImage,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        }),
      );
      await ProfileModel.insertMany(profileDocs);
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
