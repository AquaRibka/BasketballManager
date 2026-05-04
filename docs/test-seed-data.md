# Test Seed Data

## Цель документа

Этот документ описывает отдельный стабильный набор данных для тестов и QA-сценариев.
Он нужен для того, чтобы:

- тесты не зависели от demo seed;
- данные были воспроизводимыми;
- QA мог быстро пересобрать одинаковую базу.

---

## Чем test seed отличается от demo seed

Demo seed:

- ориентирован на демонстрацию MVP;
- заполняет полноценную dev-лигу;
- подходит для ручной разработки и просмотра UI/API.

Test seed:

- минимален и полностью детерминирован;
- использует явно отличимые команды и игроков;
- подходит для e2e, QA и сценариев с предсказуемыми ожиданиями.

---

## Test teams

В test seed создаются команды:

- `TSTA` — `Test Alpha Bears`
- `TSTB` — `Test Beta Falcons`
- `TSTG` — `Test Gamma Wolves`

Все команды специально помечены префиксом `Test`, чтобы их легко отличать от demo-данных.

---

## Test players

Для каждой test-команды создаётся по `5` игроков:

- `PG`
- `SG`
- `SF`
- `PF`
- `C`

Итог:

- `1` test season
- `3` test teams
- `15` test players
- `3` scheduled test matches
- `3` standings rows for `season_test_2026`

Все значения:

- фиксированы;
- не зависят от генерации;
- могут быть пересозданы одинаково на любой локальной базе.

---

## Test matches

В test seed дополнительно создаются матчи:

- `TSTA` vs `TSTB`
- `TSTB` vs `TSTG`
- `TSTG` vs `TSTA`

Все они создаются в статусе `SCHEDULED`.

Это позволяет проверять backend simulation endpoint
на реальных данных из БД сразу после test seed,
без ручного создания матча.

---

## Команды

### Заполнить только test seed

```bash
npm run prisma:seed:test
```

### Полностью сбросить локальную БД и поднять test seed

```bash
npm run prisma:reset:test
```

### Проверить backend simulation на реальной БД

```bash
npm run db:test:simulation --workspace @basketball-manager/backend
```

Скрипт:

1. запускает backend application context;
2. ищет первый `SCHEDULED` test match;
3. вызывает endpoint `POST /matches/:id/simulate`;
4. проверяет, что backend возвращает валидный результат симуляции.

---

## Reset script

`prisma:reset:test` делает следующее:

1. полностью очищает локальную БД;
2. заново применяет все миграции;
3. не запускает demo seed;
4. запускает именно test seed.

Это самый удобный сценарий для:

- QA;
- e2e;
- ручной проверки backend API;
- воспроизводимых локальных багрепортов.

---

## Deterministic values

В test seed все данные жёстко зафиксированы:

- названия команд;
- shortName;
- имена игроков;
- позиции;
- рейтинги;
- атрибуты;
- overall;
- potential.

Это значит, что:

- тестовые ожидания можно писать точно;
- данные не “дрейфуют” между перезапусками;
- можно сравнивать ответы API без случайных расхождений.

---

## Где находится реализация

- demo seed: [prisma/seed.mjs](/home/newuser/Documents/BM/prisma/seed.mjs:1)
- test seed: [prisma/seed-test.mjs](/home/newuser/Documents/BM/prisma/seed-test.mjs:1)

---

## Итог

Для проекта теперь есть два независимых seed-режима:

- demo seed для обычной разработки;
- test seed для стабильных тестов и QA.

Это позволяет держать тестовые данные предсказуемыми и при этом не ломать dev-сценарий команды.
