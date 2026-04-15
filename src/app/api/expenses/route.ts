import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";

const expenseProjection = {
  title: 1,
  amount: 1,
  categoryId: 1,
  paidBy: 1,
  date: 1,
  note: 1,
  emoji: 1,
  items: 1,
  createdAt: 1,
  updatedAt: 1,
} as const;

/* GET /api/expenses — list all expenses (newest first) */
export async function GET() {
  try {
    await connectDB();
    const expenses = await ExpenseModel.find()
      .select(expenseProjection)
      .sort({ createdAt: -1 })
      .lean();

    // transform lean documents
    const result = expenses.map((e) => ({
      id: String(e._id),
      title: e.title,
      amount: e.amount,
      categoryId: e.categoryId,
      paidBy: e.paidBy,
      date: e.date,
      note: e.note ?? "",
      emoji: e.emoji ?? "",
      items: (e.items as Array<{ name: string; price: number }>) ?? [],
      createdAt:
        e.createdAt instanceof Date
          ? e.createdAt.toISOString()
          : String(e.createdAt),
      updatedAt:
        e.updatedAt instanceof Date
          ? e.updatedAt.toISOString()
          : String(e.updatedAt),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}

/* POST /api/expenses — create a new expense */
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const expense = await ExpenseModel.create({
      title: body.title,
      amount: body.amount,
      categoryId: body.categoryId,
      paidBy: body.paidBy,
      date: body.date,
      note: body.note ?? "",
      emoji: body.emoji ?? "",
      items: body.items ?? [],
    });

    const result = {
      id: String(expense._id),
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId,
      paidBy: expense.paidBy,
      date: expense.date,
      note: expense.note ?? "",
      emoji: expense.emoji ?? "",
      items: (expense.items as Array<{ name: string; price: number }>) ?? [],
      createdAt: expense.createdAt
        ? new Date(expense.createdAt as unknown as string).toISOString()
        : new Date().toISOString(),
      updatedAt: expense.updatedAt
        ? new Date(expense.updatedAt as unknown as string).toISOString()
        : new Date().toISOString(),
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 },
    );
  }
}
