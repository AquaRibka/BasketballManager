# Конфигурационная схема

## Цель документа

Этот документ фиксирует минимальный набор переменных окружения для MVP,
которые используются или будут использоваться в:

- `backend`
- `frontend`
- `database`
- `Prisma`
- `Docker`

Главная задача — сделать локальный запуск предсказуемым и использовать одни и те же имена переменных во всех слоях проекта.

---

## Общие правила

- Все локальные переменные хранятся в `.env`
- Пример конфигурации хранится в `.env.example`
- `.env` не коммитится в Git
- Секреты и реальные пароли не должны попадать в репозиторий

---

## Обязательные переменные MVP

## Runtime

### `NODE_ENV`

- Назначение: режим запуска приложения
- Значение по умолчанию для локальной разработки: `development`

Использование:

- backend
- frontend tooling
- Docker runtime

---

## Backend

### `API_HOST`

- Назначение: host backend-приложения
- Пример: `0.0.0.0`

### `API_PORT`

- Назначение: порт backend-приложения
- Пример: `3000`

### `BACKEND_URL`

- Назначение: базовый URL backend для локальных интеграций и документации
- Пример: `http://localhost:3000`

---

## Frontend

### `FRONTEND_PORT`

- Назначение: локальный порт frontend dev server
- Пример: `5173`

### `FRONTEND_API_URL`

- Назначение: URL backend API, к которому обращается frontend
- Пример: `http://localhost:3000`

---

## Database

### `POSTGRES_DB`

- Назначение: имя базы данных PostgreSQL
- Пример: `basketball_manager`

### `POSTGRES_USER`

- Назначение: пользователь PostgreSQL
- Пример: `bm_user`

### `POSTGRES_PASSWORD`

- Назначение: пароль пользователя PostgreSQL
- Пример: локальный dev password

### `POSTGRES_PORT`

- Назначение: локальный порт PostgreSQL
- Пример: `5432`

---

## Prisma

### `DATABASE_URL`

- Назначение: основная строка подключения Prisma для локального запуска с хоста
- Пример:

```env
DATABASE_URL=postgresql://bm_user:bm_dev_password@localhost:5432/basketball_manager?schema=public
```

### `DIRECT_URL`

- Назначение: direct connection URL для Prisma
- В MVP совпадает с `DATABASE_URL`

### `DATABASE_URL_DOCKER`

- Назначение: строка подключения Prisma/Backend внутри docker-compose сети
- Пример:

```env
DATABASE_URL_DOCKER=postgresql://bm_user:bm_dev_password@postgres:5432/basketball_manager?schema=public
```

---

## Docker

Для локального Docker запуска используются те же базовые переменные:

- `NODE_ENV`
- `API_HOST`
- `API_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `DATABASE_URL_DOCKER`

### Правило

Внутри compose-сети backend должен использовать:

- `DATABASE_URL_DOCKER`

А при локальном запуске с хоста:

- `DATABASE_URL`

---

## Минимальный набор для `.env.example`

```env
NODE_ENV=development

API_HOST=0.0.0.0
API_PORT=3000
BACKEND_URL=http://localhost:3000

FRONTEND_PORT=5173
FRONTEND_API_URL=http://localhost:3000

POSTGRES_DB=basketball_manager
POSTGRES_USER=bm_user
POSTGRES_PASSWORD=bm_dev_password
POSTGRES_PORT=5432

DATABASE_URL=postgresql://bm_user:bm_dev_password@localhost:5432/basketball_manager?schema=public
DIRECT_URL=postgresql://bm_user:bm_dev_password@localhost:5432/basketball_manager?schema=public
DATABASE_URL_DOCKER=postgresql://bm_user:bm_dev_password@postgres:5432/basketball_manager?schema=public
```

---

## Правила использования в коде

### Backend

- читает `NODE_ENV`
- читает `API_HOST`
- читает `API_PORT`
- читает `DATABASE_URL`

### Frontend

- читает `FRONTEND_API_URL`
- при необходимости читает `FRONTEND_PORT`

### Prisma

- использует `DATABASE_URL`
- использует `DIRECT_URL`

### Docker

- для backend использует `DATABASE_URL_DOCKER`
- для postgres использует `POSTGRES_*`

---

## Итоговое правило

```text
.env хранит локальные переменные.
.env.example хранит безопасный пример.
DATABASE_URL используется с хоста.
DATABASE_URL_DOCKER используется внутри docker-compose.
API_PORT определяет backend порт.
FRONTEND_API_URL определяет, куда frontend ходит за API.
NODE_ENV определяет режим запуска.
```
