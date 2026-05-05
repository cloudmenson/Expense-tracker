import mongoose, { Schema } from "mongoose";

export type UtilityKind =
  | "gas"
  | "cold_water"
  | "hot_water"
  | "electricity"
  | "internet"
  | "rent";

export interface ITariff {
  _id: mongoose.Types.ObjectId;
  familyId: string;
  kind: UtilityKind;
  pricePerUnit: number;
  unitLabel: string;
  effectiveFrom: string;
  createdAt: Date;
  updatedAt: Date;
}

const TariffSchema = new Schema(
  {
    familyId: { type: String, default: "default", index: true },
    kind: {
      type: String,
      enum: ["gas", "cold_water", "hot_water", "electricity", "internet", "rent"],
      required: true,
    },
    pricePerUnit: { type: Number, required: true },
    unitLabel: { type: String, required: true },
    effectiveFrom: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

TariffSchema.index({ familyId: 1, kind: 1, effectiveFrom: 1 });

TariffSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const TariffModel =
  mongoose.models.Tariff ?? mongoose.model("Tariff", TariffSchema);
