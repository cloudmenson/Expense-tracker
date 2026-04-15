import mongoose, { Schema } from "mongoose";

export interface IProfile {
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
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema(
  {
    _id: { type: String, required: true },
    familyId: { type: String, default: "default", index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#e11d48" },
    monthlyIncome: { type: Number, default: 0 },
    role: { type: String, enum: ["owner", "member"], default: "member" },
    status: { type: String, enum: ["active", "invited"], default: "active" },
    inviteEmail: { type: String },
    avatarEmoji: { type: String, default: "👤" },
    avatarImage: { type: String },
  },
  {
    _id: false,
    versionKey: false,
    timestamps: true,
  },
);

ProfileSchema.index({ familyId: 1, createdAt: 1 });

ProfileSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const ProfileModel =
  mongoose.models.Profile ?? mongoose.model("Profile", ProfileSchema);
