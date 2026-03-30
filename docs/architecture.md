# Архитектура LexiMemo в нотации C4

## Кратко

LexiMemo реализован как монолитный fullstack на Next.js App Router. С точки зрения C4 это не набор микросервисов, а одна веб-система с тремя основными контейнерами:

- `Web Client / PWA` в браузере пользователя
- `Next.js Application Server` с SSR/RSC, API routes и бизнес-логикой
- `PostgreSQL` как основное хранилище

Снаружи от системы есть два значимых внешних участника:

- `AI Generation Service` для preview AI-карточек
- `Browser Speech API` для озвучки слов на клиенте

Готовые исходники диаграмм:

- [`docs/c4-container.puml`](./c4-container.puml)
- [`docs/c4-nextjs-server-components.puml`](./c4-nextjs-server-components.puml)

Эти файлы можно отрендерить любым PlantUML-рендерером в PNG или SVG.

## Система и границы

Граница системы `LexiMemo` включает код, который контролируется этим репозиторием:

- клиентский интерфейс на React и Next.js
- серверный Next.js runtime с App Router
- внутренний HTTP API на `src/app/api/**`
- серверные сервисы в `src/server/**`
- доступ к БД через Prisma
- PWA-слой: manifest, service worker, install prompt

В границу системы не входят:

- браузер как платформа исполнения
- внешний AI endpoint
- встроенный Web Speech API браузера

## C4 Container View

### Контейнеры внутри системы

| Контейнер | Технологии | Ответственность | Основные связи |
| --- | --- | --- | --- |
| `Web Client / PWA` | Next.js client runtime, React 19, Service Worker | Отрисовка интерактивных экранов, отправка `fetch()` на внутренние API, install prompt, browser TTS | Ходит в `Next.js Application Server`, использует `Browser Speech API` |
| `Next.js Application Server` | Next.js 16, Node.js runtime, App Router, Auth.js, Zod, Prisma | SSR/RSC-рендеринг, аутентификация, route handlers, бизнес-логика колод, карточек, review, прогресса и AI | Обслуживает `Web Client / PWA`, работает с `PostgreSQL`, вызывает `AI Generation Service` |
| `PostgreSQL` | PostgreSQL + Prisma schema | Хранение пользователей, колод, карточек, review history, daily activity, stats, achievements | Используется только серверным контейнером |

### Внешние системы

| Внешняя система | Назначение | Кто использует |
| --- | --- | --- |
| `AI Generation Service` | Генерирует preview карточек по prompt | `Next.js Application Server` |
| `Browser Speech API` | Озвучивает слово по `languageCode` на клиенте | `Web Client / PWA` |

## Контейнерные взаимодействия

### 1. Вход и регистрация

1. Пользователь открывает `Web Client / PWA`.
2. Клиент загружает страницы `/login` или `/register` с `Next.js Application Server`.
3. Регистрация идет через `POST /api/auth/register`, где сервер валидирует запрос, хеширует пароль и создает `User` в `PostgreSQL`.
4. Вход выполняется через Auth.js Credentials provider.
5. Сервер читает пользователя из `PostgreSQL`, проверяет `passwordHash`, создает сессию на основе JWT и отдает session cookie.

### 2. Просмотр страниц и SSR/RSC

1. Пользователь переходит по страницам `src/app/(app)/**` и `src/app/(auth)/**`.
2. `Next.js Application Server` рендерит layout и страницы на сервере.
3. Для чтения данных server components вызывают сервисы напрямую, без промежуточного REST-вызова к самим себе.
4. Примеры:
   - список колод вызывает `listUserDecks()` и `getUserProgress()`
   - страница колоды вызывает `getUserDeckById()` и `listCardsByDeck()`
   - приватный layout проверяет сессию через `getCurrentUserId()`

Это важная особенность архитектуры: чтение для SSR идет напрямую через сервисный слой, а не через публичный HTTP API.

### 3. CRUD колод и карточек

1. Пользователь работает с клиентскими формами `DeckForm` и `CardForm`.
2. Эти формы отправляют `fetch()` на внутренние route handlers:
   - `POST /api/decks`
   - `PUT /api/decks/[deckId]`
   - `POST /api/decks/[deckId]/cards`
   - `PUT /api/decks/[deckId]/cards/[cardId]`
   - `DELETE ...`
3. Route handler:
   - получает текущего пользователя
   - валидирует payload через Zod
   - вызывает нужный сервис
   - возвращает JSON-ответ
4. После успешной мутации клиент вызывает `router.refresh()`, и данные на серверных страницах перечитываются заново.

### 4. Учебная сессия и интервальное повторение

1. Компонент `StudySession` открывает `GET /api/decks/[deckId]/study`.
2. Сервер вызывает `listDueCardsForDeck()` и возвращает только карточки, у которых `nextReviewAt <= now` или `nextReviewAt is null`.
3. После ответа пользователя клиент вызывает `POST /api/decks/[deckId]/study/review`.
4. Серверный `submitReviewForCard()`:
   - проверяет владение колодой и карточкой
   - проверяет, что карточка еще действительно `due`
   - рассчитывает следующее состояние через `calculateNextReview()`
   - обновляет `Card`
   - создает запись в `ReviewHistory`
   - в той же транзакции вызывает `registerReviewProgress()`
5. `registerReviewProgress()` обновляет:
   - `UserStats`
   - `DailyStudyActivity`
   - `Achievement`
6. Клиент получает новый `currentStreak` и список новых достижений, затем показывает следующую карточку.

### 5. AI-генерация карточек

1. Пользователь открывает `AICardGenerator` внутри страницы колоды.
2. Клиент вызывает `POST /api/decks/[deckId]/ai/preview`.
3. Сервер проверяет право доступа к колоде, валидирует запрос и передает prompt в `generateCardsPreviewByPrompt()`.
4. `Next.js Application Server` делает внешний HTTPS-вызов в `AI Generation Service`.
5. Ответ upstream-сервиса нормализуется и проверяется на строгий JSON-формат.
6. Клиент показывает preview карточек, но еще ничего не сохраняет в БД.
7. Только после подтверждения пользователь вызывает `POST /api/decks/[deckId]/ai/save`.
8. Сервер массово создает карточки в `PostgreSQL` через `createManyCardsInDeck()`.

### 6. PWA-поведение

1. `RootLayout` подключает `PwaBootstrap`.
2. На клиенте регистрируется `public/sw.js`.
3. Service worker кэширует shell и статические ресурсы, но не перехватывает `/api/*`.
4. При проблемах сети навигация может падать в `/offline`.
5. `InstallPrompt` слушает `beforeinstallprompt` и предлагает установку как отдельного приложения.

## Текстовая спецификация контейнерной схемы

Ниже описание в формате, из которого можно вручную или автоматически собрать C4 Container Diagram.

### Узлы

- `Person`: `Пользователь`
- `System Boundary`: `LexiMemo`
- `Container` внутри `LexiMemo`: `Web Client / PWA`
- `Container` внутри `LexiMemo`: `Next.js Application Server`
- `ContainerDb` внутри `LexiMemo`: `PostgreSQL`
- `External System`: `AI Generation Service`
- `External System`: `Browser Speech API`

### Подписи контейнеров

- `Web Client / PWA`
  - `Next.js client runtime, React 19, Service Worker`
  - `Study session, CRUD формы, AI preview/save, install prompt, browser TTS`
- `Next.js Application Server`
  - `Next.js 16, App Router, Auth.js, Zod, Prisma`
  - `SSR/RSC, route handlers, auth, business logic`
- `PostgreSQL`
  - `User, Deck, Card, ReviewHistory, DailyStudyActivity, UserStats, Achievement`

### Связи

- `Пользователь -> Web Client / PWA`: `Использует приложение`
- `Web Client / PWA -> Next.js Application Server`: `HTML/RSC, navigation, JSON API, HTTPS`
- `Next.js Application Server -> Web Client / PWA`: `SSR/RSC markup, JSON responses, session cookies`
- `Next.js Application Server -> PostgreSQL`: `Чтение и запись данных через Prisma`
- `Next.js Application Server -> AI Generation Service`: `Запрос preview карточек по prompt, HTTPS/JSON`
- `Web Client / PWA -> Browser Speech API`: `Озвучивание слова через Web Speech API`

## C4 Component View для контейнера `Next.js Application Server`

Этот контейнер можно разумно детализировать до компонентов, потому что в нем сосредоточена почти вся бизнес-логика системы.

### Компоненты

| Компонент | Файлы | Ответственность |
| --- | --- | --- |
| `App Router Pages & Layouts` | `src/app/(app)/**`, `src/app/(auth)/**`, `src/widgets/header/**` | Server-side рендеринг страниц, редиректы, композиция экранов, первичное чтение данных |
| `API Route Handlers` | `src/app/api/**` | JSON API для мутаций, study flow, AI preview/save, health, register |
| `Auth & Session` | `src/server/auth/**` | Credentials login, чтение сессии, извлечение текущего пользователя |
| `Validation Layer` | `src/server/validation/**`, `src/server/http/validation.ts` | Zod-валидация входных payload и конвертация ошибок |
| `Deck Service` | `src/server/decks/deck.service.ts` | CRUD колод и ownership checks |
| `Card Service` | `src/server/cards/card.service.ts` | CRUD карточек и массовое сохранение AI-карточек |
| `Review Service` | `src/server/review/review.service.ts`, `src/features/review/model/spaced-repetition.ts` | Очередь due-карточек, review submission, расчет следующего интервала |
| `Progress Service` | `src/server/progress/progress.service.ts` | Streak, daily activity, stats, achievements |
| `AI Card Generation Service` | `src/server/ai/ai-card-generation.service.ts` | Формирование prompt, вызов upstream AI, нормализация ответа |
| `Prisma Client Adapter` | `src/lib/prisma.ts` | Единая точка доступа к PostgreSQL |

### Взаимодействия компонентов

- `App Router Pages & Layouts -> Auth & Session`
  - для проверки доступа в приватном layout и получения текущего пользователя
- `App Router Pages & Layouts -> Deck Service`
  - для SSR списка колод и деталей колоды
- `App Router Pages & Layouts -> Card Service`
  - для SSR списка карточек колоды
- `App Router Pages & Layouts -> Progress Service`
  - для SSR блока прогресса на странице колод
- `API Route Handlers -> Auth & Session`
  - для всех защищенных endpoint
- `API Route Handlers -> Validation Layer`
  - для валидации request body
- `API Route Handlers -> Deck Service / Card Service`
  - для CRUD-операций
- `API Route Handlers -> Review Service`
  - для `study` и `study/review`
- `API Route Handlers -> AI Card Generation Service`
  - для preview AI-карточек
- `Review Service -> Progress Service`
  - для обновления streak, статистики и achievements внутри одной транзакции review
- `Deck Service / Card Service / Review Service / Progress Service / Auth & Session -> Prisma Client Adapter`
  - для всех обращений к БД
- `AI Card Generation Service -> AI Generation Service`
  - для внешнего AI-вызова

## Почему эта архитектура подходит для MVP

- не требует отдельного backend-сервиса и отдельного frontend-репозитория
- хорошо объясняется на защите диплома как единый fullstack-монолит
- позволяет совместить SSR-страницы и интерактивные client components
- снижает инфраструктурную сложность, но сохраняет разделение на UI, API, сервисы и persistence
- позволяет позже вынести AI, review или auth в отдельные сервисы без полной переработки доменной модели
