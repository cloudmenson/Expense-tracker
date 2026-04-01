import mongoose, { Schema } from "mongoose";

export interface IExpense {
  _id: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  categoryId: string;
  paidBy: "person1" | "person2";
  date: string;
  note?: string;
  emoji?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    categoryId: { type: String, required: true },
    paidBy: { type: String, enum: ["person1", "person2"], required: true },
    date: { type: String, required: true },
    note: { type: String, default: "" },
    emoji: { type: String, default: "" },
  },
  {
    timestamps: true,
  },
);

ExpenseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
  },
});

export const ExpenseModel =
  mongoose.models.Expense ?? mongoose.model("Expense", ExpenseSchema);
