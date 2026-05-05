import mongoose, { Schema } from "mongoose";

export interface ILandlord {
  _id: string;
  familyId: string;
  name: string;
  phone?: string;
  photo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LandlordSchema = new Schema(
  {
    _id: { type: String, default: "default" },
    familyId: { type: String, default: "default", index: true },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    photo: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  {
    _id: false,
    versionKey: false,
    timestamps: true,
  },
);

LandlordSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret._id;
  },
});

export const LandlordModel =
  mongoose.models.Landlord ?? mongoose.model("Landlord", LandlordSchema);
