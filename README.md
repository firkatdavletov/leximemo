# LexiMemo MVP (Next.js + Prisma)

Стартовый fullstack-каркас для дипломного MVP: приложение для изучения и запоминания иностранных слов (по типу Anki).

## Что уже настроено

- Next.js (App Router) + TypeScript
- Tailwind CSS + ESLint
- Backend в этом же проекте через Route Handlers
- Prisma ORM + PostgreSQL (под Neon/Postgres-совместимые БД)
- Базовые API endpoints:
  - `GET /api/health`
  - `GET /api/decks`
  - `POST /api/decks`
- Базовые страницы:
  - `/`
  - `/login`
  - `/decks`
  - `/decks/[deckId]`
- UI-shell компоненты:
  - `Header`, `Container`, `PageTitle`, `EmptyState`, `Button`
- Подготовка под PWA (добавлен `manifest.webmanifest` без offline-first логики)

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Создайте локальный env-файл:

```bash
cp .env.example .env
```

3. Заполните `DATABASE_URL` и `DIRECT_URL` в `.env`.

4. Сгенерируйте Prisma Client:

```bash
npm run prisma:generate
```

5. Примените первую миграцию:

```bash
npm run prisma:migrate -- --name init
```

6. Запустите dev-сервер:

```bash
npm run dev
```

Откройте `http://localhost:3000`.

## Prisma команды

```bash
npm run prisma:format
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:studio
```

## Структура проекта

```text
src/
  app/
    (auth)/login/page.tsx
    (app)/decks/page.tsx
    (app)/decks/[deckId]/page.tsx
    api/health/route.ts
    api/decks/route.ts
    layout.tsx
    page.tsx
  entities/
    deck/model/types.ts
  features/
    README.md
  lib/
    prisma.ts
  server/
    decks/deck.service.ts
    decks/mock-data.ts
  shared/
    config/app.ts
    lib/cn.ts
    types/api.ts
    ui/button.tsx
    ui/container.tsx
    ui/page-title.tsx
    ui/empty-state.tsx
  widgets/
    header/header.tsx
```

## Что делать дальше

- Добавить реальную авторизацию и привязку данных к пользователю.
- Реализовать CRUD для карточек и колод.
- Внедрить логику повторений (SM-2 или упрощенный алгоритм).
- Добавить валидацию входных данных и централизованную обработку ошибок.
- Расширить PWA-подготовку: иконки, install prompt, service worker.
