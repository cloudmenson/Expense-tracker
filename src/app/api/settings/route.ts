import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SettingsModel } from "@/models/settings";
import { ProfileModel } from "@/models/profile";

const DEFAULT_SETTINGS = {
  currency: "$",
  person1Name: "Партнер 1",
  person2Name: "Партнер 2",
  person1Income: 2500,
  person2Income: 2500,
  theme: "system" as const,
};

/* GET /api/settings — get app settings (auto-create defaults if missing) */
export async function GET() {
  try {
    await connectDB();

    let settings = await SettingsModel.findById("default").lean();

    // Auto-create defaults on first run
    if (!settings) {
      settings = await SettingsModel.create({
        _id: "default",
        ...DEFAULT_SETTINGS,
      });
      settings = await SettingsModel.findById("default").lean();
    }

    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const legacyBudget =
      typeof settings.monthlyBudget === "number" ? settings.monthlyBudget : 0;

    const result = {
      currency: settings.currency,
      person1Name: settings.person1Name,
      person2Name: settings.person2Name,
      person1Income:
        typeof settings.person1Income === "number"
          ? settings.person1Income
          : Math.round(legacyBudget / 2),
      person2Income:
        typeof settings.person2Income === "number"
          ? settings.person2Income
          : legacyBudget - Math.round(legacyBudget / 2),
      theme: settings.theme,
      person1Color: settings.person1Color ?? "#e11d48",
      person2Color: settings.person2Color ?? "#3b82f6",
    };

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("GET /api/settings error:", msg);
    return NextResponse.json(
      { error: "Failed to fetch settings", detail: msg },
      { status: 500 },
    );
  }
}

/* PUT /api/settings — update app settings */
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const settings = await SettingsModel.findByIdAndUpdate("default", body, {
      new: true,
      upsert: true,
      runValidators: true,
    }).lean();

    if (!settings) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 },
      );
    }

    const legacyBudget =
      typeof settings.monthlyBudget === "number" ? settings.monthlyBudget : 0;

    const result = {
      currency: settings.currency,
      person1Name: settings.person1Name,
      person2Name: settings.person2Name,
      person1Income:
        typeof settings.person1Income === "number"
          ? settings.person1Income
          : Math.round(legacyBudget / 2),
      person2Income:
        typeof settings.person2Income === "number"
          ? settings.person2Income
          : legacyBudget - Math.round(legacyBudget / 2),
      theme: settings.theme,
      person1Color: settings.person1Color ?? "#e11d48",
      person2Color: settings.person2Color ?? "#3b82f6",
    };

    // Keep profile entity in sync with current settings (scaffold for future auth/invite)
    await Promise.all([
      ProfileModel.findByIdAndUpdate(
        "person1",
        {
          _id: "person1",
          familyId: "default",
          name: result.person1Name,
          color: result.person1Color,
          monthlyIncome: result.person1Income,
          role: "owner",
          status: "active",
          avatarEmoji: "🧑",
        },
        { upsert: true, runValidators: true },
      ),
      ProfileModel.findByIdAndUpdate(
        "person2",
        {
          _id: "person2",
          familyId: "default",
          name: result.person2Name,
          color: result.person2Color,
          monthlyIncome: result.person2Income,
          role: "member",
          status: "active",
          avatarEmoji: "🧑",
        },
        { upsert: true, runValidators: true },
      ),
    ]);

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("PUT /api/settings error:", msg);
    return NextResponse.json(
      { error: "Failed to update settings", detail: msg },
      { status: 500 },
    );
  }
}
