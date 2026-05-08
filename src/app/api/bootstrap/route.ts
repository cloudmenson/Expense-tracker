import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { CategoryModel } from "@/models/category";
import { ExpenseModel } from "@/models/expense";
import { ProfileModel } from "@/models/profile";
import { SettingsModel } from "@/models/settings";

const CORE_PROFILE_IDS = ["person1", "person2"] as const;

const expenseProjection = {
  title: 1,
  amount: 1,
  categoryId: 1,
  paidBy: 1,
  date: 1,
  note: 1,
  emoji: 1,
  items: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

const categoryProjection = {
  name: 1,
  emoji: 1,
  color: 1,
  isCustom: 1,
} as const;

const settingsProjection = {
  currency: 1,
  theme: 1,
} as const;

const profileProjection = {
  _id: 1,
  name: 1,
  color: 1,
  monthlyIncome: 1,
  avatarImage: 1,
} as const;

export async function GET() {
  try {
    await connectDB();

    const [rawExpenses, rawCategories, rawSettings, rawProfiles] =
      await Promise.all([
        ExpenseModel.find()
          .select(expenseProjection)
          .sort({ createdAt: -1 })
          .lean(),
        CategoryModel.find().select(categoryProjection).lean(),
        SettingsModel.findById("default").select(settingsProjection).lean(),
        ProfileModel.find({
          familyId: "default",
          _id: { $in: CORE_PROFILE_IDS },
        })
          .select(profileProjection)
          .lean(),
      ]);

    let categories = rawCategories;
    if (categories.length === 0) {
      await CategoryModel.insertMany(
        DEFAULT_CATEGORIES.map((c) => ({
          _id: c.id,
          name: c.name,
          emoji: c.emoji,
          color: c.color,
          isCustom: c.isCustom,
        })),
      );
      categories = await CategoryModel.find().select(categoryProjection).lean();
    }

    let settings = rawSettings;
    if (!settings) {
      await SettingsModel.create({ _id: "default" });
      settings = await SettingsModel.findById("default")
        .select(settingsProjection)
        .lean();
    }

    let profiles = rawProfiles;
    if (profiles.length < CORE_PROFILE_IDS.length) {
      const profileById = new Map(rawProfiles.map((p) => [String(p._id), p]));
      const missing = CORE_PROFILE_IDS.filter((id) => !profileById.has(id));

      if (missing.length > 0) {
        const docs = missing.map((id) =>
          id === "person1"
            ? {
                _id: "person1",
                familyId: "default",
                name: "Партнер 1",
                color: "#e11d48",
                monthlyIncome: 2500,
                role: "owner" as const,
                status: "active" as const,
                avatarEmoji: "👤",
              }
            : {
                _id: "person2",
                familyId: "default",
                name: "Партнер 2",
                color: "#3b82f6",
                monthlyIncome: 2500,
                role: "member" as const,
                status: "active" as const,
                avatarEmoji: "👤",
              },
        );

        await ProfileModel.insertMany(docs);
      }

      profiles = await ProfileModel.find({
        familyId: "default",
        _id: { $in: CORE_PROFILE_IDS },
      })
        .select(profileProjection)
        .lean();
    }

    const profileMap = new Map(profiles.map((p) => [String(p._id), p]));
    const p1 = profileMap.get("person1");
    const p2 = profileMap.get("person2");

    return NextResponse.json({
      expenses: rawExpenses.map((e) => ({
        id: String(e._id),
        title: e.title,
        amount: e.amount,
        categoryId: e.categoryId,
        paidBy: e.paidBy,
        date: e.date,
        note: e.note ?? "",
        emoji: e.emoji ?? "",
        items: (e.items as Array<{ name: string; price: number }>) ?? [],
        createdAt:
          e.createdAt instanceof Date
            ? e.createdAt.toISOString()
            : String(e.createdAt),
        updatedAt:
          e.updatedAt instanceof Date
            ? e.updatedAt.toISOString()
            : String(e.updatedAt),
      })),
      categories: categories.map((c) => ({
        id: String(c._id),
        name: c.name,
        emoji: c.emoji,
        color: c.color,
        isCustom: c.isCustom,
      })),
      settings: {
        currency: settings?.currency ?? "₴",
        theme: settings?.theme ?? "system",
        person1Name: p1?.name ?? "Партнер 1",
        person2Name: p2?.name ?? "Партнер 2",
        person1Income: p1?.monthlyIncome ?? 2500,
        person2Income: p2?.monthlyIncome ?? 2500,
        person1Color: p1?.color ?? "#e11d48",
        person2Color: p2?.color ?? "#3b82f6",
        person1AvatarImage: p1?.avatarImage || undefined,
        person2AvatarImage: p2?.avatarImage || undefined,
      },
    });
  } catch (error) {
    console.error("GET /api/bootstrap error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bootstrap data" },
      { status: 500 },
    );
  }
}
