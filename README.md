# LexiMemo MVP (Next.js + Prisma + Auth.js)

Дипломный MVP для изучения слов по карточкам.

## Технологии

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth.js (NextAuth) + Credentials
- bcryptjs для хеширования паролей

## Реализовано на этом этапе

- Регистрация и логин по email/password
- Logout
- Защищенные страницы `/decks/**`
- Проверка ownership на сервере для всех операций с колодами и карточками
- CRUD колод
- CRUD карточек внутри колод

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env`:

```bash
cp .env.example .env
```

3. Заполните переменные окружения в `.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Пример для локальной БД:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/firkatdavletov?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/firkatdavletov?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-long-random-secret"
```

4. Примените миграции и сгенерируйте Prisma Client:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

5. Запустите seed с тестовым пользователем:

```bash
npm run prisma:seed
```

6. Запустите проект:

```bash
npm run dev
```

Откройте `http://localhost:3000`.

## Тестовый пользователь

После `npm run prisma:seed`:

- email: `demo@leximemo.local`
- password: `demo12345`

Можно переопределить через переменные:

- `SEED_TEST_EMAIL`
- `SEED_TEST_PASSWORD`
- `SEED_TEST_NAME`

## Маршруты страниц

- `/login`
- `/register`
- `/decks`
- `/decks/new`
- `/decks/[deckId]`
- `/decks/[deckId]/edit`
- `/decks/[deckId]/cards/new`
- `/decks/[deckId]/cards/[cardId]/edit`

## API маршруты

- `GET /api/health`
- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`
- `GET|POST /api/decks`
- `GET|PUT|DELETE /api/decks/[deckId]`
- `GET|POST /api/decks/[deckId]/cards`
- `GET|PUT|DELETE /api/decks/[deckId]/cards/[cardId]`

## Prisma команды

```bash
npm run prisma:format
npm run prisma:generate
npm run prisma:migrate -- --name <migration_name>
npm run prisma:studio
npm run prisma:seed
```

## Важно по безопасности

- Пароли в БД хранятся только в виде хеша (`passwordHash`).
- Ownership-проверка выполняется на сервере во всех CRUD-операциях.
- Пользователь не может читать/изменять/удалять чужие колоды и карточки.
