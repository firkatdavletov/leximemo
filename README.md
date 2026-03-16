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
- Daily streak + агрегированная статистика пользователя
- Achievements (unlock'и хранятся в БД, определения в коде)
- AI генерация карточек по prompt (preview + confirm save)

## Режим обучения

На странице колоды есть кнопка `Начать обучение`.

Учебная сессия:

1. Загружает карточки колоды, которые доступны к повторению (`nextReviewAt IS NULL` или `nextReviewAt <= now`).
2. Показывает слово.
3. После кнопки `Показать ответ` показывает перевод/пример/картинку.
4. Пользователь выбирает оценку: `Сложно`, `Нормально`, `Легко`.
5. Сервер пересчитывает интервал, обновляет прогресс карточки и пишет запись в `ReviewHistory`.
6. После прохождения всех карточек показывается экран завершения со статистикой сессии.
7. После каждого review на сервере обновляются `DailyStudyActivity`, `UserStats`, streak и achievements.

## Streak и активности

Модели:

- `DailyStudyActivity(userId, activityDate, reviewsCount, sessionsCount)`
- `UserStats(currentStreak, longestStreak, totalReviewedCards, totalStudySessions, lastStudyDate)`

Логика streak (выполняется на сервере после каждого review):

1. Если активность уже была в этот день -> `currentStreak` не растет.
2. Если последняя активность была вчера -> `currentStreak + 1`.
3. Если пропуск больше 1 дня -> `currentStreak = 1`.
4. `longestStreak = max(longestStreak, currentStreak)`.
5. `totalReviewedCards` увеличивается на каждый review.
6. `totalStudySessions` в MVP увеличивается один раз за день (в первый review дня).

## Achievements

Определения хранятся в коде (`src/entities/achievement/model/types.ts`), unlock'и в таблице `Achievement`:

- `FIRST_REVIEW`
- `FIRST_DECK_COMPLETED`
- `STREAK_3`
- `STREAK_7`
- `REVIEWS_10`
- `REVIEWS_50`

Дубли не допускаются за счет `@@unique([userId, code])` + серверной проверки перед сохранением.

`FIRST_DECK_COMPLETED` открывается, когда в колоде не остается карточек с `repetitionsCount = 0`.

## AI генерация карточек

Сценарий:

1. Пользователь открывает колоду.
2. Нажимает `Generate with AI`.
3. Вводит `prompt` и `cardsCount` (1..20).
4. Сервер запрашивает AI и возвращает preview.
5. Пользователь подтверждает сохранение.
6. Карточки сохраняются в колоду.

Интеграция:

- endpoint: `POST https://kong-proxy.yc.amvera.ru/api/v1/models/gpt`
- auth: заголовок `X-Auth-Token: Bearer <OPENAI_API_KEY>`
- structured output: `response_format.type = json_schema`
- ключ используется только на сервере (`OPENAI_API_KEY`), на клиент не уходит

Ожидаемая структура:

```json
{
  "cards": [
    {
      "word": "travel",
      "translation": "путешествие",
      "example": "I love to travel in summer.",
      "imagePrompt": "optional"
    }
  ]
}
```

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
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Пример:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/firkatdavletov?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/firkatdavletov?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-long-random-secret"
OPENAI_API_KEY="your-token"
OPENAI_MODEL="gpt"
```

4. Примените миграции и сгенерируйте Prisma Client:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name streaks_and_ai
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
- `POST /api/decks/[deckId]/ai/preview`
- `POST /api/decks/[deckId]/ai/save`

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
