import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-start justify-center gap-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
        404
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">
        Страница не найдена.
      </h1>
      <p className="max-w-xl text-lg leading-8 text-muted">
        Возможно, маршрут еще не создан или ссылка устарела.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white"
      >
        Вернуться на главную
      </Link>
    </main>
  );
}
