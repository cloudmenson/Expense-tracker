import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ProfileModel } from "@/models/profile";

/* PUT /api/profiles/[id] — update one profile */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = (await request.json()) as Record<string, unknown>;
    const {
      name,
      color,
      monthlyIncome,
      avatarEmoji,
      avatarImage,
      status,
      role,
    } = body;

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = String(name).trim();
    if (color !== undefined) patch.color = color;
    if (monthlyIncome !== undefined)
      patch.monthlyIncome = Number(monthlyIncome);
    if (avatarEmoji !== undefined) patch.avatarEmoji = avatarEmoji;
    // avatarImage: empty string means "clear"; any other string means "set"
    if (avatarImage !== undefined) patch.avatarImage = String(avatarImage);
    if (status !== undefined) patch.status = status;
    if (role !== undefined) patch.role = role;
    // Always update the timestamp so stale reads don't mask a missing write
    patch.updatedAt = new Date();

    const raw = await ProfileModel.findOneAndUpdate(
      { _id: id },
      { $set: patch },
      {
        new: true,
        runValidators: true,
      },
    )
      .select({
        _id: 1,
        familyId: 1,
        name: 1,
        color: 1,
        monthlyIncome: 1,
        role: 1,
        status: 1,
        inviteEmail: 1,
        avatarEmoji: 1,
        avatarImage: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean();

    if (!raw) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: String(raw._id),
      familyId: raw.familyId,
      name: raw.name,
      color: raw.color,
      monthlyIncome: raw.monthlyIncome,
      role: raw.role,
      status: raw.status,
      inviteEmail: raw.inviteEmail,
      avatarEmoji: raw.avatarEmoji,
      // Return undefined (omitted from JSON) only when genuinely absent
      avatarImage: raw.avatarImage || undefined,
      createdAt:
        raw.createdAt instanceof Date
          ? raw.createdAt.toISOString()
          : String(raw.createdAt),
      updatedAt:
        raw.updatedAt instanceof Date
          ? raw.updatedAt.toISOString()
          : String(raw.updatedAt),
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
