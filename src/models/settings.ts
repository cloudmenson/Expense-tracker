import mongoose, { Schema } from "mongoose";

export interface ISettings {
  _id: string;
  currency: string;
  person1Name: string;
  person2Name: string;
  person1Income: number;
  person2Income: number;
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
    person1Income: { type: Number, default: 2500 },
    person2Income: { type: Number, default: 2500 },
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
