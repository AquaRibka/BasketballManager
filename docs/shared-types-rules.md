# Правила Shared Types

## Цель документа

Этот документ фиксирует, какие типы проекта должны переиспользоваться между:

- `backend`
- `frontend`
- `simulation engine`

и где именно они должны лежать.

Главная цель — избежать дублирования одних и тех же сущностей в разных пакетах,
но при этом не превращать `shared` в свалку любых типов проекта.

---

## Базовое решение для MVP

В MVP:

- пакет `packages/shared` **используется**
- общие типы и контракты выносятся в `packages/shared`
- инфраструктурные, ORM-специфичные и framework-специфичные типы в `shared` **не выносятся**

То есть решение проекта на MVP:

```text
Shared package есть и используется,
но только для действительно общих domain/API/simulation контрактов.
```

---

## Что должно лежать в `packages/shared`

В `shared` выносятся только те типы, которые нужны минимум в двух местах проекта.

### 1. Domain types

Это типы сущностей, которые одинаково понимаются в нескольких слоях:

- `Team`
- `Player`
- `Season`
- `Match`
- `Round`
- `StandingsRow`
- `Career`

### Когда выносить domain type в shared

Если один и тот же смысл нужен:

- в backend как часть доменной модели;
- во frontend как отображаемая сущность;
- в simulation engine как вход или выход вычисления.

### Пример

Если `Match` нужен:

- backend для хранения и orchestration;
- frontend для календаря;
- simulation engine для расчёта,

то базовая форма `Match` должна быть в `shared`.

---

### 2. DTO types

DTO выносятся в `shared`, если они являются контрактом между frontend и backend.

Примеры:

- `CreateCareerDto`
- `CareerSummaryDto`
- `TeamDetailsDto`
- `StandingsDto`
- `RoundDto`
- `SimulateRoundRequestDto`
- `SimulateRoundResponseDto`

### Правило

Если frontend отправляет или получает структуру через API,
и backend ожидает или возвращает эту же структуру,
то тип DTO должен жить в `shared`.

---

### 3. Simulation input/output types

Все контракты между backend и `simulation engine` также должны быть общими и лежать в `shared`.

Примеры:

- `SimulationTeam`
- `SimulationPlayer`
- `SimulationMatchInput`
- `SimulationMatchResult`
- `SimulationRoundInput`
- `SimulationRoundResult`

### Почему это важно

Если backend формирует вход для симуляции,
а `simulation engine` его принимает,
то обе стороны должны использовать один и тот же контракт, а не собственные копии типов.

---

### 4. Shared enums и constants

В `shared` должны лежать:

- `PlayerPosition`
- `MatchStatus`
- `SeasonStatus`
- `CareerStatus`, если он появится
- константы диапазонов, если они нужны в нескольких слоях

Примеры:

- `PLAYER_ATTRIBUTE_MIN`
- `PLAYER_ATTRIBUTE_MAX`
- `TEAM_RATING_MIN`
- `TEAM_RATING_MAX`

---

## Что НЕ должно лежать в `packages/shared`

### 1. Prisma types и ORM-модели

Не выносим:

- Prisma-generated types
- Prisma model payloads
- Prisma client
- repository shapes

### Почему

`shared` не должен зависеть от Prisma и не должен тянуть backend storage-слой во frontend или simulation engine.

---

### 2. NestJS types

Не выносим:

- controllers
- decorators
- module classes
- provider contracts, если они специфичны для Nest runtime

---

### 3. React/UI types

Не выносим:

- component props, если они относятся только к конкретному экрану;
- view model для конкретной страницы;
- локальное состояние формы;
- UI-specific filters и sort state.

### Почему

Если тип нужен только одному экрану frontend,
ему не место в `shared`.

---

### 4. Внутренние simulation структуры

Не выносим в `shared` те типы, которые нужны только внутри `simulation engine`.

Примеры:

- промежуточные internal calculation states;
- временные коэффициенты;
- внутренние таблицы вероятностей;
- служебные engine-only структуры.

### Правило

Если тип не нужен за пределами `simulation engine`,
он должен жить внутри `packages/simulation-engine`.

---

## Какие типы переиспользуются между слоями

## Backend <-> Frontend

Между backend и frontend переиспользуются:

- DTO API;
- базовые domain summary types;
- enums;
- paging/filter/sort contracts, если они позже появятся.

### Примеры

- `TeamListItemDto`
- `TeamDetailsDto`
- `PlayerDto`
- `StandingsRowDto`
- `CareerSummaryDto`

---

## Backend <-> Simulation Engine

Между backend и simulation engine переиспользуются:

- simulation input types;
- simulation result types;
- общие enums и domain primitives.

### Примеры

- `SimulationMatchInput`
- `SimulationMatchResult`
- `SimulationPlayer`
- `SimulationTeam`
- `PlayerPosition`

---

## Frontend <-> Simulation Engine

Прямого shared-контракта между frontend и simulation engine в MVP быть не должно.

### Правило

Frontend не должен импортировать типы напрямую из simulation engine.

Если данные симуляции нужны в UI,
они должны приходить:

- либо через `shared` DTO;
- либо через backend API.

---

## Рекомендуемая структура `packages/shared`

Для MVP достаточно такой структуры:

```text
packages/shared/src/
  domain/
  dto/
  simulation/
  enums/
  constants/
  index.ts
```

### Содержимое папок

- `domain/` — базовые сущности предметной области
- `dto/` — API контракты между frontend и backend
- `simulation/` — input/output контракты для simulation engine
- `enums/` — общие перечисления
- `constants/` — общие доменные константы

---

## Naming rules

### Для domain types

Использовать простые имена сущностей:

- `Team`
- `Player`
- `Season`
- `Match`
- `Round`

### Для DTO

Использовать суффикс `Dto`:

- `CreateCareerDto`
- `TeamDetailsDto`
- `StandingsDto`

### Для simulation contracts

Использовать явный префикс `Simulation`:

- `SimulationTeam`
- `SimulationPlayer`
- `SimulationMatchInput`
- `SimulationMatchResult`

### Для enums

Использовать существительное в единственном числе:

- `PlayerPosition`
- `MatchStatus`
- `SeasonStatus`

### Для строк таблицы

Использовать:

- `StandingsRow`

а не смешивать с:

- `TableRow`
- `RankingRow`

Если термин уже выбран как `Standings`, нужно держаться его везде.

---

## Практическое правило принятия решения

Перед тем как положить тип в `shared`, нужно задать вопрос:

```text
Нужен ли этот тип минимум в двух пакетах проекта
и не зависит ли он от конкретного framework/runtime/storage?
```

Если ответ:

- `да` — тип идёт в `shared`
- `нет` — тип остаётся локальным

---

## Что выносим в shared уже на MVP

Минимальный обязательный набор:

- `PlayerPosition`
- `MatchStatus`
- `SeasonStatus`
- `Team`
- `Player`
- `Match`
- `Round`
- `StandingsRow`
- `Career`
- `SimulationMatchInput`
- `SimulationMatchResult`
- `TeamDetailsDto`
- `PlayerDto`
- `StandingsDto`
- `CreateCareerDto`

---

## Что можно не выносить на MVP

Можно оставить локально:

- backend-only persistence types;
- frontend-only view models;
- simulation-only internal calculation types;
- Prisma model helpers;
- Nest request context types.

---

## Итоговое правило

```text
Shared хранит только общие domain types, DTO, enums,
constants и simulation contracts.

Prisma, Nest, React UI-specific и simulation-internal типы
в shared не кладём.
```
