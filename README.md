# LexiMemo

Дипломный MVP веб-приложения для изучения и запоминания иностранных слов по карточкам в стиле Anki.

Проект сделан как единый fullstack на Next.js App Router и уже готов для локального запуска, демонстрации и установки как PWA.

## Что реализовано

- Регистрация, логин и logout через Auth.js Credentials
- Защищенные пользовательские страницы
- CRUD колод
- CRUD карточек внутри колод
- Учебная сессия с оценками `Сложно / Нормально / Легко`
- Алгоритм интервального повторения
- `ReviewHistory`, streak и пользовательская статистика
- Achievements с unlock-логикой на сервере
- AI-генерация карточек: `prompt -> preview -> confirm save`
- Browser TTS для озвучки слов
- Installable PWA: manifest, service worker, иконки, install prompt
- Демо-seed с готовым пользователем, колодами, карточками и review history

## Стек

- Next.js 16, App Router, React 19
- TypeScript
- Tailwind CSS v4
- Prisma ORM
- PostgreSQL
- NextAuth / Auth.js
- Zod

## Быстрый старт

1. Установить зависимости:

```bash
npm install
```

2. Создать локальный `.env`:

```bash
cp .env.example .env
```

3. Заполнить переменные окружения:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/leximemo?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5434/leximemo?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-long-random-secret"
OPENAI_API_KEY="optional-for-ai-preview"
OPENAI_MODEL="gpt"
SEED_TEST_EMAIL="demo@leximemo.local"
SEED_TEST_PASSWORD="demo12345"
SEED_TEST_NAME="Demo User"
```

4. Сгенерировать Prisma Client:

```bash
npm run prisma:generate
```

5. Применить миграции:

Для локальной разработки:

```bash
npm run prisma:migrate
```

Для готовой БД или деплоя:

```bash
npm run prisma:migrate:deploy
```

6. Загрузить демо-данные:

```bash
npm run prisma:seed
```

7. Запустить проект:

```bash
npm run dev
```

Проверка production-сборки:

```bash
npm run check
```

Подробная инструкция по деплою на сервер:

- [`docs/deployment.md`](/Users/firkatdavletov/WebProjects/leximemo/docs/deployment.md)

## Переменные окружения

- `DATABASE_URL`: основное подключение Prisma runtime
- `DIRECT_URL`: прямое подключение для миграций Prisma
- `NEXTAUTH_URL`: базовый URL приложения
- `NEXTAUTH_SECRET`: секрет для Auth.js
- `OPENAI_API_KEY`: серверный токен для AI preview/save
- `OPENAI_MODEL`: имя модели для AI endpoint
- `SEED_TEST_EMAIL`: email демо-пользователя
- `SEED_TEST_PASSWORD`: пароль демо-пользователя
- `SEED_TEST_NAME`: имя демо-пользователя

## Prisma и служебные команды

```bash
npm run prisma:format
npm run prisma:generate
npm run prisma:migrate -- --name <migration_name>
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:studio
npm run prisma:seed
```

## Демо-данные

После `npm run prisma:seed` по умолчанию создается пользователь:

- email: `demo@leximemo.local`
- password: `demo12345`

Seed подготавливает:

- несколько колод
- набор карточек с разным прогрессом
- review history за несколько дней
- streak и агрегированную статистику
- achievements для красивой демонстрации прогресса

## PWA

В проекте реализована installable PWA без тяжелого offline-first слоя.

Что есть:

- `src/app/manifest.ts` с корректным web app manifest
- `src/app/pwa-icons/[size]/route.ts` для генерации PWA-иконок `180`, `192`, `512`
- `public/sw.js` с базовым service worker
- `src/shared/pwa/pwa-bootstrap.tsx` для регистрации service worker
- `src/shared/pwa/install-prompt.tsx` для ненавязчивой кнопки установки

Что кэшируется:

- базовая оболочка приложения
- `login`, `register`, `offline`
- manifest и иконки
- часть статических ассетов Next.js

Что не реализовано специально:

- offline-модификации данных
- background sync
- push notifications
- offline auth/API layer

### Как проверить PWA локально

1. Запустить production-режим:

```bash
npm run build
npm run start
```

2. Открыть `http://localhost:3000` в Chrome или Edge.
3. Проверить в DevTools -> `Application`:
- `Manifest`
- `Service Workers`
- `Installability`
4. Установить приложение через кнопку браузера или встроенный install prompt.

Замечание:

- `localhost` подходит для service worker.
- Для установки на реальное мобильное устройство нужен HTTPS-деплой. Локальный IP без HTTPS для PWA обычно недостаточен.

## AI generation

AI-генерация работает только на сервере.

Поток:

1. Пользователь открывает колоду.
2. Нажимает блок AI-генерации.
3. Вводит тему и количество карточек.
4. Сервер обращается к upstream AI endpoint.
5. Возвращается preview карточек.
6. Пользователь подтверждает сохранение в колоду.

Особенности:

- ключ не уходит на клиент
- без `OPENAI_API_KEY` preview/save вернет понятную ошибку конфигурации
- формат ответа строго валидируется через Zod

## Интервальное повторение

Алгоритм реализован в [`src/features/review/model/spaced-repetition.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/features/review/model/spaced-repetition.ts).

Хранимые поля карточки:

- `repetitionsCount`
- `intervalDays`
- `easeFactor`
- `lastReviewedAt`
- `nextReviewAt`
- `lastGrade`
- `mistakesCount`

Логика MVP:

- первая оценка задает начальный интервал `1 / 2 / 4` дня
- дальше интервал растет или уменьшается в зависимости от оценки
- `easeFactor` ограничен диапазоном
- после review сервер обновляет карточку, пишет `ReviewHistory`, streak, stats и achievements

## Архитектура

Краткая архитектура вынесена в:

- [`docs/architecture.md`](/Users/firkatdavletov/WebProjects/leximemo/docs/architecture.md)

Сценарий показа на защите:

- [`docs/demo-script.md`](/Users/firkatdavletov/WebProjects/leximemo/docs/demo-script.md)

## Ограничения MVP

- нет полноценного offline-first режима
- нет синхронизации при конфликтующих офлайн-изменениях
- нет push notifications
- TTS зависит от браузера и доступных системных голосов
- AI-генерация зависит от внешнего upstream-сервиса
- нет отдельного тестового пакета с e2e/unit-инфраструктурой

## Возможные направления развития

- экспорт и импорт колод
- shared/public decks
- мультиязычные профили и настройки пользователя
- медиа-вложения и серверный TTS
- более продвинутый scheduling-алгоритм
- push-напоминания о повторении
- полноценный offline mode с синхронизацией

## Полезные файлы

- [`src/app/manifest.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/app/manifest.ts)
- [`public/sw.js`](/Users/firkatdavletov/WebProjects/leximemo/public/sw.js)
- [`prisma/seed.mjs`](/Users/firkatdavletov/WebProjects/leximemo/prisma/seed.mjs)
- [`docs/demo-script.md`](/Users/firkatdavletov/WebProjects/leximemo/docs/demo-script.md)
- [`docs/architecture.md`](/Users/firkatdavletov/WebProjects/leximemo/docs/architecture.md)
