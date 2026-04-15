import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SettingsModel } from "@/models/settings";
import { ProfileModel } from "@/models/profile";

/* GET /api/settings — returns currency + theme from Settings,
   person name / color / income from the two core Profiles */
export async function GET() {
  try {
    await connectDB();

    let settings = await SettingsModel.findById("default")
      .select({ currency: 1, theme: 1 })
      .lean();
    if (!settings) {
      settings = await SettingsModel.create({ _id: "default" });
      settings = await SettingsModel.findById("default")
        .select({ currency: 1, theme: 1 })
        .lean();
    }

    const profiles = await ProfileModel.find({
      familyId: "default",
      _id: { $in: ["person1", "person2"] },
    })
      .select({
        _id: 1,
        name: 1,
        color: 1,
        monthlyIncome: 1,
        avatarImage: 1,
      })
      .lean();

    const profileMap = new Map(profiles.map((p) => [String(p._id), p]));
    const p1 = profileMap.get("person1");
    const p2 = profileMap.get("person2");

    return NextResponse.json({
      currency: settings?.currency ?? "$",
      theme: settings?.theme ?? "system",
      person1Name: p1?.name ?? "Партнер 1",
      person2Name: p2?.name ?? "Партнер 2",
      person1Income: p1?.monthlyIncome ?? 2500,
      person2Income: p2?.monthlyIncome ?? 2500,
      person1Color: p1?.color ?? "#e11d48",
      person2Color: p2?.color ?? "#3b82f6",
      person1AvatarImage: p1?.avatarImage || undefined,
      person2AvatarImage: p2?.avatarImage || undefined,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("GET /api/settings error:", msg);
    return NextResponse.json(
      { error: "Failed to fetch settings", detail: msg },
      { status: 500 },
    );
  }
}

/* PUT /api/settings — only updates currency and theme */
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;

    const patch: Record<string, unknown> = {};
    if (body.currency !== undefined) patch.currency = body.currency;
    if (body.theme !== undefined) patch.theme = body.theme;

    const settings = await SettingsModel.findByIdAndUpdate("default", patch, {
      new: true,
      upsert: true,
      runValidators: true,
    })
      .select({ currency: 1, theme: 1 })
      .lean();

    if (!settings) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 },
      );
    }

    // Re-assemble full response from profiles so caller always gets fresh data
    const profiles = await ProfileModel.find({
      familyId: "default",
      _id: { $in: ["person1", "person2"] },
    })
      .select({
        _id: 1,
        name: 1,
        color: 1,
        monthlyIncome: 1,
        avatarImage: 1,
      })
      .lean();

    const profileMap = new Map(profiles.map((p) => [String(p._id), p]));
    const p1 = profileMap.get("person1");
    const p2 = profileMap.get("person2");

    return NextResponse.json({
      currency: settings.currency,
      theme: settings.theme,
      person1Name: p1?.name ?? "Партнер 1",
      person2Name: p2?.name ?? "Партнер 2",
      person1Income: p1?.monthlyIncome ?? 2500,
      person2Income: p2?.monthlyIncome ?? 2500,
      person1Color: p1?.color ?? "#e11d48",
      person2Color: p2?.color ?? "#3b82f6",
      person1AvatarImage: p1?.avatarImage || undefined,
      person2AvatarImage: p2?.avatarImage || undefined,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("PUT /api/settings error:", msg);
    return NextResponse.json(
      { error: "Failed to update settings", detail: msg },
      { status: 500 },
    );
  }
}
