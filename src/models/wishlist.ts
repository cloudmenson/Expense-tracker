import mongoose, { Schema } from "mongoose";

export type WishStatus = "wanted" | "bought";

export interface IWishItem {
  _id: mongoose.Types.ObjectId;
  familyId: string;
  title: string;
  description?: string;
  price: number;
  photo?: string;
  link?: string;
  status: WishStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const WishItemSchema = new Schema(
  {
    familyId: { type: String, default: "default", index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    photo: { type: String, default: "" },
    link: { type: String, default: "" },
    status: {
      type: String,
      enum: ["wanted", "bought"],
      default: "wanted",
    },
    order: { type: Number, default: 0 },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

WishItemSchema.index({ familyId: 1, order: 1, createdAt: -1 });

WishItemSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const WishItemModel =
  mongoose.models.WishItem ?? mongoose.model("WishItem", WishItemSchema);
