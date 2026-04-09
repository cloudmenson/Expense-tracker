import mongoose, { Schema } from "mongoose";

export interface ITrashItem {
  _id: mongoose.Types.ObjectId;
  type: "expense" | "category";
  originalId: string;
  data: Record<string, unknown>;
  deletedAt: Date;
}

const TrashSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["expense", "category"],
      required: true,
    },
    originalId: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

// Auto-remove after 7 days
TrashSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

TrashSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const TrashModel =
  mongoose.models.Trash ?? mongoose.model("Trash", TrashSchema);
