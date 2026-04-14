import mongoose, { Schema } from "mongoose";

export interface ISettings {
  _id: string;
  currency: string;
  theme: "light" | "dark" | "system";
}

const SettingsSchema = new Schema(
  {
    _id: { type: String, default: "default" },
    currency: { type: String, default: "$" },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
  },
  {
    _id: false,
    versionKey: false,
  },
);

SettingsSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    delete ret._id;
  },
});

export const SettingsModel =
  mongoose.models.Settings ?? mongoose.model("Settings", SettingsSchema);
