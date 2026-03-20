# Architecture Summary

## Общая идея

LexiMemo реализован как единый fullstack-проект на Next.js App Router. Это позволило держать UI, серверную бизнес-логику, API routes и Prisma-схему в одном репозитории без лишней инфраструктурной сложности, что хорошо подходит для дипломного MVP.

## Высокоуровневая схема

- Frontend: Next.js App Router, server components и client components для интерактивных сценариев
- Auth: NextAuth Credentials
- Server logic: API routes в `src/app/api/**` и серверные сервисы в `src/server/**`
- Database: PostgreSQL через Prisma
- PWA: `manifest.ts`, `public/sw.js`, динамические PWA-иконки и клиентская регистрация service worker

## Основные сущности БД

- `User`: учетная запись пользователя
- `Deck`: колода карточек пользователя
- `Card`: карточка со словом, переводом и scheduling-полями
- `ReviewHistory`: история повторений по карточкам
- `DailyStudyActivity`: агрегированная активность по дням
- `UserStats`: текущий streak, лучший streak, количество повторений и учебных дней
- `Achievement`: unlocked-достижения пользователя

## Frontend и server logic

- Страницы в `src/app/(app)/**` и `src/app/(auth)/**`
- Интерактивные формы и сценарии находятся в `src/features/**`
- Общие UI-компоненты находятся в `src/shared/ui/**`
- Серверные проверки доступа и работа с БД вынесены в `src/server/**`

Такой подход позволяет не доверять клиенту: ownership-check и обновление важных сущностей происходят на сервере.

## Где реализован алгоритм интервального повторения

- Файл: [`src/features/review/model/spaced-repetition.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/features/review/model/spaced-repetition.ts)

Алгоритм получает текущее состояние карточки и оценку пользователя, затем рассчитывает:

- новый интервал
- новый `easeFactor`
- новый `mistakesCount`
- `nextReviewAt`

Фактическое сохранение результата review выполняется в серверном сервисе:

- [`src/server/review/review.service.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/server/review/review.service.ts)

## Где реализованы streak и achievements

- [`src/server/progress/progress.service.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/server/progress/progress.service.ts)
- [`src/entities/achievement/model/types.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/entities/achievement/model/types.ts)

После каждого review сервер:

- обновляет `DailyStudyActivity`
- пересчитывает `UserStats`
- обновляет `currentStreak` и `longestStreak`
- определяет, нужно ли открыть новые achievements

## Где реализована AI-генерация карточек

- UI: [`src/features/ai/ai-card-generator.tsx`](/Users/firkatdavletov/WebProjects/leximemo/src/features/ai/ai-card-generator.tsx)
- API routes:
  - [`src/app/api/decks/[deckId]/ai/preview/route.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/app/api/decks/[deckId]/ai/preview/route.ts)
  - [`src/app/api/decks/[deckId]/ai/save/route.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/app/api/decks/[deckId]/ai/save/route.ts)
- Server integration:
  - [`src/server/ai/ai-card-generation.service.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/server/ai/ai-card-generation.service.ts)

Поток разделен на два шага:

1. Получить preview от AI.
2. Явно подтвердить сохранение в БД.

Это безопаснее для MVP и удобнее для демонстрации.

## Почему выбран единый Next.js fullstack-проект

- меньше инфраструктуры для дипломного проекта
- единый типизированный код на TypeScript
- проще защищать архитектуру на демо
- меньше накладных расходов на интеграцию frontend/backend
- быстрее развивать MVP в одном репозитории

## PWA-слой

- Manifest: [`src/app/manifest.ts`](/Users/firkatdavletov/WebProjects/leximemo/src/app/manifest.ts)
- Service worker: [`public/sw.js`](/Users/firkatdavletov/WebProjects/leximemo/public/sw.js)
- Регистрация SW: [`src/shared/pwa/pwa-bootstrap.tsx`](/Users/firkatdavletov/WebProjects/leximemo/src/shared/pwa/pwa-bootstrap.tsx)
- Install prompt: [`src/shared/pwa/install-prompt.tsx`](/Users/firkatdavletov/WebProjects/leximemo/src/shared/pwa/install-prompt.tsx)

PWA-реализация intentionally легкая:

- installability есть
- базовый shell/static caching есть
- сложной офлайн-синхронизации нет

Это соответствует цели дипломного MVP: показать современный installable web app без лишнего overengineering.
