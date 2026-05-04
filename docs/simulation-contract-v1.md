# Simulation Contract v1

## Цель документа

Этот документ фиксирует MVP-контракт между `apps/backend` и
`packages/simulation-engine`.

Его задача:

- задать единый typed shape для входа симуляции матча;
- задать единый typed shape для результата симуляции матча;
- зафиксировать team/player snapshots;
- описать явный mapping из Prisma DB-моделей во вход движка.

Источник типов:

- `@basketball-manager/shared`
- `MatchSimulationInput`
- `MatchSimulationResult`
- `MatchSimulationTeamSnapshot`
- `MatchSimulationPlayerSnapshot`

---

## MatchSimulationInput

```ts
interface MatchSimulationInput {
  matchId: string;
  seed: string;
  homeTeam: MatchSimulationTeamSnapshot;
  awayTeam: MatchSimulationTeamSnapshot;
}
```

### Поля

- `matchId` — идентификатор матча в backend/БД.
- `seed` — deterministic seed для генератора случайных чисел.
- `homeTeam` — snapshot хозяев на момент запуска симуляции.
- `awayTeam` — snapshot гостей на момент запуска симуляции.

### MVP правило для seed

В MVP отдельное поле seed в БД не требуется.
Backend формирует:

```ts
seed = match.id;
```

Этого достаточно, чтобы один и тот же матч симулировался детерминированно при одинаковом входе.

---

## Team Snapshot

```ts
interface MatchSimulationTeamSnapshot {
  id: string;
  name: string;
  shortName: string;
  rating: number;
  players: MatchSimulationPlayerSnapshot[];
}
```

### Назначение

Team snapshot передает в engine состояние команды,
не привязывая engine к Prisma-моделям и структуре БД.

### MVP состав snapshot

- `id` — ID команды.
- `name` — полное имя команды.
- `shortName` — короткое имя/аббревиатура.
- `rating` — агрегированный рейтинг команды.
- `players` — список игроков, участвующих в расчете силы состава.

---

## Player Snapshot

```ts
type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

interface MatchSimulationPlayerSnapshot {
  id: string;
  name: string;
  position: PlayerPosition;
  overall: number;
  shooting: number;
  passing: number;
  defense: number;
  rebounding: number;
  athleticism: number;
}
```

### Назначение

Player snapshot содержит только данные,
которые нужны матчевой симуляции в MVP.

В него намеренно не входят:

- `createdAt`
- `updatedAt`
- `potential`
- `age`
- `teamId`

Эти поля важны для домена и БД,
но не обязательны для расчета результата матча в текущем объеме MVP.

---

## MatchSimulationResult

```ts
interface MatchSimulationResult {
  matchId: string;
  seed: string;
  winnerTeamId: string;
  loserTeamId: string;
  homeScore: number;
  awayScore: number;
  overtimeCount: number;
  score: {
    home: number;
    away: number;
  };
  statistics: {
    homeTeam: MatchSimulationTeamStatistics;
    awayTeam: MatchSimulationTeamStatistics;
  };
}
```

### Поля результата

- `matchId` — ID симулированного матча.
- `seed` — seed, реально использованный движком.
- `winnerTeamId` — ID победителя.
- `loserTeamId` — ID проигравшего.
- `homeScore` — итоговый счет хозяев.
- `awayScore` — итоговый счет гостей.
- `overtimeCount` — количество сыгранных overtime-периодов.
- `score` — grouped score object для явного контракта.
- `statistics` — командная статистика матча.

### MatchSimulationTeamStatistics

```ts
interface MatchSimulationTeamStatistics {
  possessions: number;
  fieldGoalsMade: number;
  fieldGoalsAttempted: number;
  threePointsMade: number;
  threePointsAttempted: number;
  freeThrowsMade: number;
  freeThrowsAttempted: number;
  assists: number;
  rebounds: number;
  turnovers: number;
  steals: number;
  blocks: number;
  fouls: number;
}
```

### Seed rule

- если `seed` передан во входе, engine обязан вернуть воспроизводимый результат для того же `input + seed`;
- если `seed` не передан, engine обязан сгенерировать runtime seed сам;
- сгенерированный seed возвращается в `result.seed` и может быть использован повторно для отладки.

### MVP правило результата

В MVP backend обязан сохранять как минимум:

- `homeScore`
- `awayScore`
- `winnerTeamId`
- `playedAt`
- `status = COMPLETED`

`statistics` уже входит в контракт engine,
но может пока не сохраняться в БД, пока schema не расширена под box score.

### Overtime rule

Если после regulation итоговый счет равный,
engine обязан разыгрывать overtime-периоды до появления победителя.

MVP-правило:

- ничья в финальном результате недопустима;
- каждый overtime добавляет небольшой блок очков обеим командам;
- `overtimeCount = 0` означает победу в основное время.

---

## Mapping из Prisma в MatchSimulationInput

Backend должен выполнять явный mapping,
а не передавать Prisma payload в engine напрямую.

### Источник данных

- `Match.id -> matchId`
- `Match.id -> seed` только если backend хочет воспроизводимую симуляцию;
- `Match.homeTeam -> homeTeam`
- `Match.awayTeam -> awayTeam`
- `Team.players -> team.players`

### Mapping Team

```ts
{
  id: team.id,
  name: team.name,
  shortName: team.shortName,
  rating: team.rating,
  players: team.players.map(...)
}
```

### Mapping Player

```ts
{
  id: player.id,
  name: player.name,
  position: player.position,
  overall: player.overall,
  shooting: player.shooting,
  passing: player.passing,
  defense: player.defense,
  rebounding: player.rebounding,
  athleticism: player.athleticism
}
```

### Важно

Engine не должен принимать:

- Prisma client
- Prisma model instances как зависимость слоя
- SQL/ORM-specific поля
- NestJS DTO

Backend отвечает за преобразование DB-моделей в общий simulation contract.

---

## Пример

```json
{
  "matchId": "cmatch0001",
  "seed": "cmatch0001",
  "homeTeam": {
    "id": "cteam_home",
    "name": "CSKA Moscow",
    "shortName": "CSKA",
    "rating": 88,
    "players": [
      {
        "id": "cplayer_1",
        "name": "Alex Carter",
        "position": "SG",
        "overall": 82,
        "shooting": 84,
        "passing": 76,
        "defense": 73,
        "rebounding": 60,
        "athleticism": 81
      }
    ]
  },
  "awayTeam": {
    "id": "cteam_away",
    "name": "UNICS Kazan",
    "shortName": "UNICS",
    "rating": 84,
    "players": [
      {
        "id": "cplayer_2",
        "name": "Mike Brown",
        "position": "PG",
        "overall": 79,
        "shooting": 77,
        "passing": 83,
        "defense": 71,
        "rebounding": 55,
        "athleticism": 79
      }
    ]
  }
}
```

---

## Итог для MVP-2

Зафиксированный контракт v1 решает четыре задачи sprint scope:

- `Input type` — определен.
- `Result type` — определен.
- `Team snapshot` — определен.
- `Player snapshot` — определен.

И дополнительно фиксирует важное архитектурное правило:
backend преобразует DB-модели в simulation input,
а `simulation-engine` работает только с общим контрактом из `shared`.
