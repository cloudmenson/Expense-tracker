import mongoose, { Schema } from "mongoose";

export interface IRentReading {
  kind: string;
  previous: number;
  current: number;
  photo?: string;
}

export interface IRentMonth {
  _id: mongoose.Types.ObjectId;
  familyId: string;
  month: string;
  rentAmount: number;
  invoicePhoto?: string;
  charged?: number;
  paid?: number;
  paidAt?: string;
  readings: IRentReading[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReadingSchema = new Schema(
  {
    kind: { type: String, required: true },
    previous: { type: Number, default: 0 },
    current: { type: Number, default: 0 },
    photo: { type: String, default: "" },
  },
  { _id: false },
);

const RentMonthSchema = new Schema(
  {
    familyId: { type: String, default: "default", index: true },
    month: { type: String, required: true },
    rentAmount: { type: Number, default: 0 },
    invoicePhoto: { type: String, default: "" },
    charged: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
    paidAt: { type: String, default: "" },
    readings: { type: [ReadingSchema], default: [] },
    notes: { type: String, default: "" },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

RentMonthSchema.index({ familyId: 1, month: 1 }, { unique: true });

RentMonthSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const RentMonthModel =
  mongoose.models.RentMonth ?? mongoose.model("RentMonth", RentMonthSchema);
