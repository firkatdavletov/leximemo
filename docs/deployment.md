# Инструкция по деплою LexiMemo на сервер

Документ описывает деплой production-версии приложения LexiMemo на сервер с Node.js и PostgreSQL. Проект использует Next.js, Prisma ORM, NextAuth и PostgreSQL.

## 1. Требования к серверу

Минимальная конфигурация:

- Ubuntu 22.04/24.04 или другой Linux-сервер
- Node.js 20+
- npm
- PostgreSQL 14+
- Git
- Nginx для reverse proxy
- домен с HTTPS-сертификатом

Проверка версий:

```bash
node -v
npm -v
psql --version
git --version
```

## 2. Подготовка PostgreSQL

Зайдите в PostgreSQL под пользователем `postgres`:

```bash
sudo -u postgres psql
```

Создайте пользователя и базу данных:

```sql
CREATE USER leximemo_user WITH PASSWORD 'strong_password_here';
CREATE DATABASE leximemo OWNER leximemo_user;
GRANT ALL PRIVILEGES ON DATABASE leximemo TO leximemo_user;
```

Выйдите из консоли:

```sql
\q
```

Production connection string:

```env
DATABASE_URL="postgresql://leximemo_user:strong_password_here@localhost:5432/leximemo?schema=public"
DIRECT_URL="postgresql://leximemo_user:strong_password_here@localhost:5432/leximemo?schema=public"
```

## 3. Загрузка проекта на сервер

Перейдите в директорию для приложений:

```bash
cd /var/www
sudo git clone <repository-url> leximemo
sudo chown -R $USER:$USER /var/www/leximemo
cd /var/www/leximemo
```

Установите зависимости:

```bash
npm ci
```

Если на сервере нет lock-файла или установка через `npm ci` невозможна, используйте:

```bash
npm install
```

## 4. Настройка переменных окружения

Создайте `.env` в корне проекта:

```bash
cp .env.example .env
nano .env
```

Пример production-конфигурации:

```env
DATABASE_URL="postgresql://leximemo_user:strong_password_here@localhost:5432/leximemo?schema=public"
DIRECT_URL="postgresql://leximemo_user:strong_password_here@localhost:5432/leximemo?schema=public"

NEXTAUTH_URL="https://example.com"
NEXTAUTH_SECRET="replace-with-long-random-secret"

OPENAI_API_KEY="paste-your-x-auth-token-here"
OPENAI_MODEL="gpt"

SEED_TEST_EMAIL="demo@leximemo.local"
SEED_TEST_PASSWORD="demo12345"
SEED_TEST_NAME="Demo User"
```

Сгенерировать секрет для `NEXTAUTH_SECRET` можно так:

```bash
openssl rand -base64 32
```

Важно:

- `NEXTAUTH_URL` должен совпадать с публичным адресом приложения.
- `OPENAI_API_KEY` нужен для AI-генерации карточек. Без него остальное приложение будет работать, но AI-превью вернет ошибку конфигурации.
- `SEED_TEST_*` нужны только для демо-данных.

## 5. Prisma и миграции

Сгенерируйте Prisma Client:

```bash
npm run prisma:generate
```

Примените production-миграции:

```bash
npm run prisma:migrate:deploy
```

Опционально загрузите демо-данные:

```bash
npm run prisma:seed
```

Для реального production-окружения seed лучше не запускать, если демо-пользователь не нужен.

## 6. Production-сборка

Проверьте проект:

```bash
npm run lint
npm run build
```

Или одной командой:

```bash
npm run check
```

После успешной сборки можно запускать приложение:

```bash
npm run start
```

По умолчанию Next.js поднимется на порту `3000`.

## 7. Запуск через PM2

Установите PM2:

```bash
npm install -g pm2
```

Запустите приложение:

```bash
pm2 start npm --name leximemo -- run start
```

Сохраните процесс и включите автозапуск:

```bash
pm2 save
pm2 startup
```

После команды `pm2 startup` PM2 выведет команду, которую нужно выполнить с `sudo`.

Полезные команды:

```bash
pm2 status
pm2 logs leximemo
pm2 restart leximemo
pm2 stop leximemo
```

## 8. Настройка Nginx

Создайте конфиг:

```bash
sudo nano /etc/nginx/sites-available/leximemo
```

Пример конфигурации:

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируйте конфиг:

```bash
sudo ln -s /etc/nginx/sites-available/leximemo /etc/nginx/sites-enabled/leximemo
sudo nginx -t
sudo systemctl reload nginx
```

## 9. HTTPS через Certbot

Установите Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Выпустите сертификат:

```bash
sudo certbot --nginx -d example.com -d www.example.com
```

Проверьте автообновление:

```bash
sudo certbot renew --dry-run
```

HTTPS нужен для корректной работы PWA на реальном домене.

## 10. Обновление приложения

Для обновления уже развернутого приложения:

```bash
cd /var/www/leximemo
git pull
npm ci
npm run prisma:generate
npm run prisma:migrate:deploy
npm run build
pm2 restart leximemo
```

Если используется `npm install` вместо `npm ci`, замените команду установки зависимостей.

## 11. Проверка после деплоя

Откройте приложение в браузере:

```text
https://example.com
```

Проверьте:

- регистрация нового пользователя
- вход и выход
- создание колоды
- создание карточки
- импорт карточек из JSON
- AI-генерация карточек, если настроен `OPENAI_API_KEY`
- учебная сессия
- PWA manifest и service worker в DevTools

Health endpoint:

```text
https://example.com/api/health
```

## 12. Деплой на Amvera

В проекте уже есть файл `amvera.yaml`:

```yaml
meta:
  environment: node
  toolchain:
    name: npm
    version: 20

build:
  additionalCommands: npm run prisma:generate && npm run build

run:
  command: npm run prisma:migrate:deploy && npm run start
  containerPort: 3000
```

Для деплоя на Amvera нужно:

1. Загрузить репозиторий в Amvera.
2. Добавить PostgreSQL или указать внешний PostgreSQL.
3. В панели переменных окружения задать:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="https://your-amvera-domain"
NEXTAUTH_SECRET="long-random-secret"
OPENAI_API_KEY="optional-ai-token"
OPENAI_MODEL="gpt"
```

4. Запустить сборку и деплой.

Amvera выполнит:

- `npm run prisma:generate`
- `npm run build`
- `npm run prisma:migrate:deploy`
- `npm run start`

## 13. Частые проблемы

Ошибка подключения к базе:

- проверьте `DATABASE_URL` и `DIRECT_URL`
- проверьте доступность PostgreSQL
- проверьте пароль и имя базы

Ошибка авторизации NextAuth:

- проверьте `NEXTAUTH_URL`
- проверьте `NEXTAUTH_SECRET`
- после смены домена пересоберите и перезапустите приложение

AI-генерация не работает:

- проверьте `OPENAI_API_KEY`
- проверьте, что переменная задана на сервере, а не только локально
- проверьте логи приложения через `pm2 logs leximemo`

PWA не устанавливается:

- проверьте HTTPS
- проверьте manifest в DevTools
- проверьте регистрацию service worker

Production build падает:

- выполните `npm run prisma:generate`
- проверьте переменные окружения
- проверьте версию Node.js
- запустите `npm run lint` и `npm run build` отдельно, чтобы увидеть точную причину
