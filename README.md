# LexiMemo MVP (Next.js + Prisma + Auth.js)

Дипломный MVP для изучения слов по карточкам в стиле Anki.

## Технологии

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Auth.js (NextAuth) + Credentials
- bcryptjs
- zod

## Реализовано

- Регистрация, логин и logout
- Защищенные страницы `/decks/**`
- Ownership-check на сервере для колод и карточек
- CRUD колод
- CRUD карточек
- Режим обучения по колоде
- Упрощенный алгоритм интервального повторения
- Хранение прогресса карточек и ReviewHistory

## Режим обучения

На странице колоды есть кнопка `Начать обучение`.

Учебная сессия:

1. Загружает карточки колоды, которые доступны к повторению (`nextReviewAt IS NULL` или `nextReviewAt <= now`).
2. Показывает слово.
3. После кнопки `Показать ответ` показывает перевод/пример/картинку.
4. Пользователь выбирает оценку: `Сложно`, `Нормально`, `Легко`.
5. Сервер пересчитывает интервал, обновляет прогресс карточки и пишет запись в `ReviewHistory`.
6. После прохождения всех карточек показывается экран завершения со статистикой сессии.

## Алгоритм интервального повторения (MVP)

Для карточки храним:

- `repetitionsCount`
- `intervalDays`
- `easeFactor`
- `lastReviewedAt`
- `nextReviewAt`
- `lastGrade`
- `mistakesCount`

Формула:

- Первая оценка:
  - `Сложно` -> `1` день
  - `Нормально` -> `2` дня
  - `Легко` -> `4` дня
- Далее:
  - `Сложно` -> `max(1, floor(currentInterval * 0.7))`
  - `Нормально` -> `max(1, ceil(currentInterval * 1.8))`
  - `Легко` -> `max(2, ceil(currentInterval * 2.5))`

`easeFactor` тоже обновляется (упрощенно, с ограничением диапазона), чтобы метрику можно было использовать в следующих этапах.

## Быстрый старт

1. Установите зависимости:

```bash
npm install
```

2. Создайте `.env`:

```bash
cp .env.example .env
```

3. Проверьте переменные в `.env`:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Пример:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/firkatdavletov?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/firkatdavletov?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-long-random-secret"
```

4. Примените миграции и сгенерируйте Prisma Client:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name review_mode
```

5. Запустите seed:

```bash
npm run prisma:seed
```

6. Запустите приложение:

```bash
npm run dev
```

## Тестовый пользователь

После `npm run prisma:seed`:

- email: `demo@leximemo.local`
- password: `demo12345`
- создается демо-колода `Demo English Deck` с карточками

## Маршруты страниц

- `/login`
- `/register`
- `/decks`
- `/decks/new`
- `/decks/[deckId]`
- `/decks/[deckId]/edit`
- `/decks/[deckId]/cards/new`
- `/decks/[deckId]/cards/[cardId]/edit`
- `/decks/[deckId]/study`

## API маршруты

- `GET /api/health`
- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`
- `GET|POST /api/decks`
- `GET|PUT|DELETE /api/decks/[deckId]`
- `GET|POST /api/decks/[deckId]/cards`
- `GET|PUT|DELETE /api/decks/[deckId]/cards/[cardId]`
- `GET /api/decks/[deckId]/study`
- `POST /api/decks/[deckId]/study/review`

## Prisma команды

```bash
npm run prisma:format
npm run prisma:generate
npm run prisma:migrate -- --name <migration_name>
npm run prisma:studio
npm run prisma:seed
```

## Безопасность

- Пароли хранятся только в виде хеша (`passwordHash`).
- Любые приватные операции выполняются только от текущего пользователя.
- На сервере везде выполняется ownership-check.
- Нельзя читать/изменять/удалять чужие колоды, карточки и review-данные.
