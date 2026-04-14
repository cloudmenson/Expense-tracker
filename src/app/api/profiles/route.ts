import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProfileModel } from "@/models/profile";
import { SettingsModel } from "@/models/settings";

const toIso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : new Date().toISOString();

/* GET /api/profiles — list family profiles, auto-seed first two from settings */
export async function GET() {
  try {
    await connectDB();

    let profiles = await ProfileModel.find({ familyId: "default" })
      .sort({ createdAt: 1 })
      .lean();

    if (profiles.length === 0) {
      const settings = await SettingsModel.findById("default").lean();

      const person1Name = settings?.person1Name ?? "Партнер 1";
      const person2Name = settings?.person2Name ?? "Партнер 2";
      const person1Color = settings?.person1Color ?? "#e11d48";
      const person2Color = settings?.person2Color ?? "#3b82f6";
      const person1Income = settings?.person1Income ?? 2500;
      const person2Income = settings?.person2Income ?? 2500;

      await ProfileModel.insertMany([
        {
          _id: "person1",
          familyId: "default",
          name: person1Name,
          color: person1Color,
          monthlyIncome: person1Income,
          role: "owner",
          status: "active",
          avatarEmoji: "🧑",
        },
        {
          _id: "person2",
          familyId: "default",
          name: person2Name,
          color: person2Color,
          monthlyIncome: person2Income,
          role: "member",
          status: "active",
          avatarEmoji: "🧑",
        },
      ]);

      profiles = await ProfileModel.find({ familyId: "default" })
        .sort({ createdAt: 1 })
        .lean();
    }

    return NextResponse.json(
      profiles.map((p) => ({
        id: String(p._id),
        familyId: p.familyId,
        name: p.name,
        color: p.color,
        monthlyIncome: p.monthlyIncome,
        role: p.role,
        status: p.status,
        inviteEmail: p.inviteEmail,
        avatarEmoji: p.avatarEmoji,
        createdAt: toIso(p.createdAt),
        updatedAt: toIso(p.updatedAt),
      })),
    );
  } catch (error) {
    console.error("GET /api/profiles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 },
    );
  }
}

/* POST /api/profiles — create invited profile placeholder */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const profile = await ProfileModel.create({
      _id: body.id ?? `inv-${Date.now()}`,
      familyId: "default",
      name: body.name ?? "Новий учасник",
      color: body.color ?? "#6366f1",
      monthlyIncome: Number(body.monthlyIncome) || 0,
      role: body.role ?? "member",
      status: body.status ?? "invited",
      inviteEmail: body.inviteEmail,
      avatarEmoji: body.avatarEmoji ?? "👤",
    });

    return NextResponse.json(
      {
        id: String(profile._id),
        familyId: profile.familyId,
        name: profile.name,
        color: profile.color,
        monthlyIncome: profile.monthlyIncome,
        role: profile.role,
        status: profile.status,
        inviteEmail: profile.inviteEmail,
        avatarEmoji: profile.avatarEmoji,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/profiles error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 },
    );
  }
}
