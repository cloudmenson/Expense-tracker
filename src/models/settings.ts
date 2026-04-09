import mongoose, { Schema } from "mongoose";

export interface ISettings {
  _id: string;
  currency: string;
  person1Name: string;
  person2Name: string;
  monthlyBudget: number;
  theme: "light" | "dark" | "system";
  person1Color?: string;
  person2Color?: string;
}

const SettingsSchema = new Schema(
  {
    _id: { type: String, default: "default" },
    currency: { type: String, default: "$" },
    person1Name: { type: String, default: "Партнер 1" },
    person2Name: { type: String, default: "Партнер 2" },
    monthlyBudget: { type: Number, default: 5000 },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    person1Color: { type: String, default: "#e11d48" },
    person2Color: { type: String, default: "#3b82f6" },
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
