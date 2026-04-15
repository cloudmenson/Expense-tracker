import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProfileModel } from "@/models/profile";

const profileProjectionBase = {
  familyId: 1,
  name: 1,
  color: 1,
  monthlyIncome: 1,
  role: 1,
  status: 1,
  inviteEmail: 1,
  avatarEmoji: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

const profileProjectionWithAvatar = {
  ...profileProjectionBase,
  avatarImage: 1,
} as const;

const toIso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : new Date().toISOString();

const serializeProfile = (p: {
  _id: string;
  familyId: string;
  name: string;
  color: string;
  monthlyIncome: number;
  role: "owner" | "member";
  status: "active" | "invited";
  inviteEmail?: string;
  avatarEmoji?: string;
  avatarImage?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}) => ({
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
  createdAt: toIso(p.createdAt),
  updatedAt: toIso(p.updatedAt),
});

/* GET /api/profiles — list family profiles, auto-seed first two from settings */
export async function GET(request: Request) {
  try {
    await connectDB();
    const includeAvatarImage =
      new URL(request.url).searchParams.get("includeAvatarImage") === "1";
    const projection = includeAvatarImage
      ? profileProjectionWithAvatar
      : profileProjectionBase;

    let profiles = await ProfileModel.find({ familyId: "default" })
      .select(projection)
      .sort({ createdAt: 1 })
      .lean();

    if (profiles.length === 0) {
      await ProfileModel.insertMany([
        {
          _id: "person1",
          familyId: "default",
          name: "Партнер 1",
          color: "#e11d48",
          monthlyIncome: 2500,
          role: "owner",
          status: "active",
          avatarEmoji: "👤",
        },
        {
          _id: "person2",
          familyId: "default",
          name: "Партнер 2",
          color: "#3b82f6",
          monthlyIncome: 2500,
          role: "member",
          status: "active",
          avatarEmoji: "👤",
        },
      ]);

      profiles = await ProfileModel.find({ familyId: "default" })
        .select(projection)
        .sort({ createdAt: 1 })
        .lean();
    }

    return NextResponse.json(
      profiles.map((p) =>
        serializeProfile({
          _id: String(p._id),
          familyId: p.familyId,
          name: p.name,
          color: p.color,
          monthlyIncome: p.monthlyIncome,
          role: p.role,
          status: p.status,
          inviteEmail: p.inviteEmail,
          avatarEmoji: p.avatarEmoji,
          avatarImage: p.avatarImage,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }),
      ),
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
      avatarImage: body.avatarImage,
    });

    return NextResponse.json(serializeProfile(profile), { status: 201 });
  } catch (error) {
    console.error("POST /api/profiles error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 },
    );
  }
}
