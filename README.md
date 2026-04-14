# Couple Expense Tracker

Стартовый проект для приватного сайта, где можно вдвоем вести учет трат, категорий, заметок и сводок по бюджету.

## Что уже настроено

- Next.js 16 + App Router
- TypeScript
- Tailwind CSS v4
- ESLint
- Базовая SEO-метаинформация
- `robots.ts` и `sitemap.ts`
- `not-found` и `global-error`
- Чистая структура под дальнейшую бизнес-логику

## Быстрый старт

1. Скопируйте пример переменных окружения:

   `cp .env.example .env.local`

2. Запустите проект:

   `npm run dev`

3. Откройте `http://localhost:3000`

## Структура

- `src/app` — маршруты и системные файлы Next.js
- `src/components` — переиспользуемые UI-компоненты
- `src/lib` — конфиг и вспомогательная логика
- `src/types` — типы предметной области

## Ближайшие шаги

1. Подключить базу данных (`Postgres` + `Prisma` или `Supabase`)
2. Добавить авторизацию для двух пользователей
3. Реализовать сущности: `expense`, `category`, `member`, `settlement`
4. Сделать форму добавления трат и месячную аналитику

## Команды

- `npm run dev` — локальная разработка
- `npm run build` — production build
- `npm run start` — запуск production-сборки
- `npm run lint` — проверка линтером
- `npm run lint:fix` — автоисправление линта
- `npm run typecheck` — проверка TypeScript

## Архитектура

См. [ARCHITECTURE.md](ARCHITECTURE.md) — там зафиксированы слои, правила и чеклист качества.
