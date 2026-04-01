import mongoose, { Schema } from "mongoose";

export interface ICategory {
  _id: string;
  name: string;
  emoji: string;
  color: string;
  isCustom: boolean;
}

const CategorySchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    emoji: { type: String, required: true },
    color: { type: String, required: true },
    isCustom: { type: Boolean, default: false },
  },
  {
    _id: false,
    versionKey: false,
  },
);

CategorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const CategoryModel =
  mongoose.models.Category ?? mongoose.model("Category", CategorySchema);
