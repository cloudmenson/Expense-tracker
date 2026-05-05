import mongoose, { Schema } from "mongoose";

export type ContactRole =
  | "landlord"
  | "realtor"
  | "neighbor"
  | "manager"
  | "other";

export interface IContact {
  _id: mongoose.Types.ObjectId;
  familyId: string;
  name: string;
  phone?: string;
  photo?: string;
  role: ContactRole;
  notes?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema(
  {
    familyId: { type: String, default: "default", index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    photo: { type: String, default: "" },
    role: {
      type: String,
      enum: ["landlord", "realtor", "neighbor", "manager", "other"],
      default: "landlord",
    },
    notes: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

ContactSchema.index({ familyId: 1, order: 1, createdAt: 1 });

ContactSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const ContactModel =
  mongoose.models.Contact ?? mongoose.model("Contact", ContactSchema);
