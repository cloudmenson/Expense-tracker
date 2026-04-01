"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Filter, Receipt, Download } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import {
  formatMoney,
  filterByMonth,
  currentMonthKey,
  getLastMonths,
} from "@/lib/utils";
import { ExpenseListItem } from "@/components/expense-list-item";
import { ExpenseForm } from "@/components/expense-form";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import type { Expense } from "@/types/expense";

export default function ExpensesPage() {
  const { expenses, categories, settings, deleteExpense } = useExpenseStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPerson, setSelectedPerson] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const months = useMemo(() => getLastMonths(12), []);

  const filtered = useMemo(() => {
    let result = [...expenses];

    // Month filter
    if (selectedMonth !== "all") {
      result = filterByMonth(result, selectedMonth);
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((e) => e.categoryId === selectedCategory);
    }

    // Person filter
    if (selectedPerson !== "all") {
      result = result.filter((e) => e.paidBy === selectedPerson);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.note?.toLowerCase().includes(q) ||
          categories
            .find((c) => c.id === e.categoryId)
            ?.name.toLowerCase()
            .includes(q),
      );
    }

    // Sort
    result.sort((a, b) =>
      sortBy === "amount" ? b.amount - a.amount : b.date.localeCompare(a.date),
    );

    return result;
  }, [
    expenses,
    selectedMonth,
    selectedCategory,
    selectedPerson,
    search,
    sortBy,
    categories,
  ]);

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const exportCSV = () => {
    const header = "Дата,Назва,Категорія,Сума,Платив,Нотатка\n";
    const rows = filtered.map((e) => {
      const cat = categories.find((c) => c.id === e.categoryId)?.name ?? "";
      const person =
        e.paidBy === "person1" ? settings.person1Name : settings.person2Name;
      return `${e.date},"${e.title}","${cat}",${e.amount},"${person}","${e.note ?? ""}"`;
    });
    const blob = new Blob([header + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Витрати
          </h1>
          <p className="mt-1 text-sm text-foreground/50">
            {filtered.length} записів ·{" "}
            {formatMoney(totalFiltered, settings.currency)}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary">
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Додати
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
          <input
            type="text"
            placeholder="Пошук витрат..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass w-full pl-9"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input-glass min-w-30 text-sm"
          >
            <option value="all">Всі місяці</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-glass min-w-30 text-sm"
          >
            <option value="all">Всі категорії</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="input-glass min-w-25 text-sm"
          >
            <option value="all">Всі</option>
            <option value="person1">{settings.person1Name}</option>
            <option value="person2">{settings.person2Name}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
            className="input-glass min-w-25 text-sm"
          >
            <option value="date">За датою</option>
            <option value="amount">За сумою</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Нічого не знайдено"
          description={
            expenses.length === 0
              ? "Додайте першу витрату"
              : "Спробуйте змінити фільтри"
          }
          action={
            expenses.length === 0
              ? { label: "Додати витрату", onClick: () => setShowForm(true) }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((exp) => (
            <ExpenseListItem
              key={exp.id}
              expense={exp}
              category={categories.find((c) => c.id === exp.categoryId)}
              currency={settings.currency}
              person1Name={settings.person1Name}
              person2Name={settings.person2Name}
              onEdit={(e) => {
                setEditing(e);
                setShowForm(true);
              }}
              onDelete={deleteExpense}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? "Редагувати витрату" : "Нова витрата"}
        size="md"
      >
        <ExpenseForm expense={editing} onDone={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
