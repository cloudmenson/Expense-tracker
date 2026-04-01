import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SettingsModel } from "@/models/settings";

const DEFAULT_SETTINGS = {
  currency: "$",
  person1Name: "Партнёр 1",
  person2Name: "Партнёр 2",
  monthlyBudget: 5000,
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

    const result = {
      currency: settings.currency,
      person1Name: settings.person1Name,
      person2Name: settings.person2Name,
      monthlyBudget: settings.monthlyBudget,
      theme: settings.theme,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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

    const result = {
      currency: settings.currency,
      person1Name: settings.person1Name,
      person2Name: settings.person2Name,
      monthlyBudget: settings.monthlyBudget,
      theme: settings.theme,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
