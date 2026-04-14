import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { CategoryModel } from "@/models/category";
import { SettingsModel } from "@/models/settings";
import { ProfileModel } from "@/models/profile";
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
      ProfileModel.deleteMany({}),
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
      theme: "system",
    });

    await ProfileModel.insertMany([
      {
        _id: "person1",
        familyId: "default",
        name: "Партнер 1",
        color: "#e11d48",
        monthlyIncome: 2500,
        role: "owner",
        status: "active",
        avatarEmoji: "🧑",
      },
      {
        _id: "person2",
        familyId: "default",
        name: "Партнер 2",
        color: "#3b82f6",
        monthlyIncome: 2500,
        role: "member",
        status: "active",
        avatarEmoji: "🧑",
      },
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/data/clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear data" },
      { status: 500 },
    );
  }
}
