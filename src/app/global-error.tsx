"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-background text-foreground">
        <main className="container flex min-h-screen flex-col items-start justify-center gap-4 py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted">
            Критическая ошибка
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Что-то пошло не так.
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted">
            {error.message || "Произошла непредвиденная ошибка приложения."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-6 text-sm font-semibold text-white"
          >
            Попробовать снова
          </button>
        </main>
      </body>
    </html>
  );
}
