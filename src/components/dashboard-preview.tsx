const summaryItems = [
  { label: "Расходы за месяц", value: "₽ 48 900" },
  { label: "Общие траты", value: "₽ 32 400" },
  { label: "Личный остаток", value: "₽ 16 500" },
];

const recentExpenses = [
  { title: "Продукты", amount: "₽ 7 240", hint: "Оплатила: Алина" },
  { title: "Квартира", amount: "₽ 18 000", hint: "Оплатил: ты" },
  { title: "Подарок", amount: "₽ 4 500", hint: "Общая категория" },
];

export function DashboardPreview() {
  return (
    <section className="surface-card rounded-xl p-5 shadow-lg shadow-brand-soft/40 sm:p-7">
      <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-sm font-medium text-muted">Апрель 2026</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            Предпросмотр дашборда
          </h2>
        </div>
        <div className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
          Черновик
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-background/70 p-4"
          >
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background/70 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Последние записи</h3>
          <span className="text-sm text-muted">3 примера</span>
        </div>

        <div className="mt-4 space-y-3">
          {recentExpenses.map((expense) => (
            <div
              key={expense.title}
              className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
            >
              <div>
                <p className="font-medium">{expense.title}</p>
                <p className="text-sm text-muted">{expense.hint}</p>
              </div>
              <p className="text-sm font-semibold">{expense.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
