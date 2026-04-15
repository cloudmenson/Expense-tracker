import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { TrashModel } from "@/models/trash";

/* PUT /api/expenses/[id] — update an expense */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();
    const body = await request.json();

    const expense = await ExpenseModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

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
      createdAt:
        expense.createdAt instanceof Date
          ? expense.createdAt.toISOString()
          : String(expense.createdAt),
      updatedAt:
        expense.updatedAt instanceof Date
          ? expense.updatedAt.toISOString()
          : String(expense.updatedAt),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/expenses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 },
    );
  }
}

/* DELETE /api/expenses/[id] — move expense to trash */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await connectDB();

    const expense = await ExpenseModel.findByIdAndDelete(id).lean();

    if (!expense) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    // Move to trash before deleting
    await TrashModel.create({
      type: "expense",
      originalId: String(expense._id),
      data: {
        title: expense.title,
        amount: expense.amount,
        categoryId: expense.categoryId,
        paidBy: expense.paidBy,
        date: expense.date,
        note: expense.note ?? "",
        emoji: expense.emoji ?? "",
        items: expense.items ?? [],
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      },
      deletedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 },
    );
  }
}
