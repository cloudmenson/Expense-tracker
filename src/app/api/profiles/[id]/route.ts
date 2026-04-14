import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProfileModel } from "@/models/profile";
import { SettingsModel } from "@/models/settings";

/* PUT /api/profiles/[id] — update one profile */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const profile = await ProfileModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (id === "person1" || id === "person2") {
      const settingsPatch =
        id === "person1"
          ? {
              person1Name: profile.name,
              person1Color: profile.color,
              person1Income: profile.monthlyIncome,
            }
          : {
              person2Name: profile.name,
              person2Color: profile.color,
              person2Income: profile.monthlyIncome,
            };

      await SettingsModel.findByIdAndUpdate("default", settingsPatch, {
        upsert: true,
      });
    }

    return NextResponse.json({
      id: String(profile._id),
      familyId: profile.familyId,
      name: profile.name,
      color: profile.color,
      monthlyIncome: profile.monthlyIncome,
      role: profile.role,
      status: profile.status,
      inviteEmail: profile.inviteEmail,
      avatarEmoji: profile.avatarEmoji,
      createdAt:
        profile.createdAt instanceof Date
          ? profile.createdAt.toISOString()
          : String(profile.createdAt),
      updatedAt:
        profile.updatedAt instanceof Date
          ? profile.updatedAt.toISOString()
          : String(profile.updatedAt),
    });
  } catch (error) {
    console.error("PUT /api/profiles/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

/* DELETE /api/profiles/[id] — remove invited profile */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    if (id === "person1" || id === "person2") {
      return NextResponse.json(
        { error: "Core profiles cannot be deleted" },
        { status: 400 },
      );
    }

    await ProfileModel.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/profiles/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 },
    );
  }
}
