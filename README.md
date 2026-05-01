# Basketball Manager

**Basketball Manager** — симулятор управления баскетбольным клубом в стиле спортивного менеджера.  
Игрок выступает в роли менеджера команды: управляет составом, следит за календарём сезона, симулирует матчи, анализирует статистику и развивает клуб на протяжении нескольких сезонов.

Проект строится как веб-приложение с отдельной серверной частью, базой данных и независимым ядром симуляции матчей.

---

## Цель проекта

Создать MVP баскетбольного менеджера, в котором пользователь может:

- просматривать команды;
- создавать и редактировать игроков;
- управлять составом команды;
- запускать симуляцию матчей;
- видеть результаты матчей;
- отслеживать турнирную таблицу;
- сохранять прогресс сезона.

---

## MVP

Первая версия проекта должна включать:

- команды;
- игроков;
- календарь сезона;
- симуляцию матчей;
- турнирную таблицу;
- сохранение результатов;
- базовый веб-интерфейс.

В MVP не входят:

- трансферы;
- финансы клуба;
- драфт;
- контракты;
- скаутинг;
- 2D/3D визуализация матчей.

Эти механики планируются после создания стабильной первой версии.

---

## Технологический стек

### Backend

- **Node.js**
- **TypeScript**
- **NestJS**
- **Prisma**
- **PostgreSQL**

### Frontend

- **React**
- **TypeScript**

### Simulation Engine

- **TypeScript**
- отдельный независимый модуль для расчёта матчей и игровой логики

### Инфраструктура

- **Docker**
- **Docker Compose**
- **Git**
- **npm workspaces**

---

## Архитектура проекта

Проект разделён на три основные части:

```text
Frontend (React)
        ↓
Backend API (NestJS)
        ↓
PostgreSQL Database

Simulation Engine
        ↑
используется backend для расчёта матчей
```

---

## Структура репозитория

```text
apps/
  backend/
  frontend/

packages/
  shared/
  simulation-engine/

prisma/
docs/
infra/
```

- `apps/backend` — backend-приложение и database smoke-tests;
- `apps/frontend` — frontend-приложение;
- `packages/shared` — общие модули и контракты;
- `packages/simulation-engine` — ядро симуляции матчей;
- `prisma` — схема и миграции PostgreSQL;
- `infra` — локальная инфраструктура и dev-утилиты.

---

## Monorepo и Workspaces

Проект использует единый package manager и workspace-структуру:

- `npm`
- `npm workspaces`

Установка зависимостей для всего репозитория:

```bash
npm install
```

---

## Команды разработки

Корневые команды:

```bash
npm run dev
npm run check
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run db:test
npm run prisma:generate
npm run prisma:migrate
```

Запуск отдельных workspace-пакетов:

```bash
npm run dev --workspace @basketball-manager/backend
npm run dev --workspace @basketball-manager/frontend
```

---

## База данных

Для локальной разработки используется PostgreSQL.

- Prisma schema: `prisma/schema.prisma`
- Docker Compose: `docker-compose.yml`
- Локальные переменные: `.env`
- Пример переменных: `.env.example`

Проверка подключения backend к базе:

```bash
npm run db:test
```

---

## Конфигурация

Проект использует локальный `.env`, который не должен попадать в Git.

Базовый порядок настройки:

```bash
cp .env.example .env
```

Ключевые переменные MVP:

- `NODE_ENV`
- `API_HOST`
- `API_PORT`
- `FRONTEND_API_URL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `DATABASE_URL`
- `DIRECT_URL`
- `DATABASE_URL_DOCKER`

Подробная схема конфигурации описана в [docs/configuration-schema.md](/home/newuser/Documents/BM/docs/configuration-schema.md:1).
