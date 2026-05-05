# API Contract v1

## Цель документа

Этот документ фиксирует первую версию API-контракта для MVP Basketball Manager.
Его задача — заранее согласовать:

- ресурсы API;
- endpoint-ы;
- входные DTO;
- формы ответов;
- типовые ошибки.

Документ описывает контракт на уровне архитектуры.
Он не требует, чтобы все endpoint-ы уже были реализованы в коде, но задаёт единый baseline для backend, frontend и shared types.

---

## Область действия v1

В `API Contract v1` входят ресурсы:

- `teams`
- `players`
- `matches`
- `seasons`
- `standings`
- `saves`

Контракт покрывает MVP-цикл:

1. создать или выбрать сохранение;
2. получить текущую карьеру и активный сезон;
3. посмотреть свою команду и состав;
4. получить календарь текущего раунда;
5. симулировать текущий раунд;
6. посмотреть результаты;
7. посмотреть таблицу;
8. перейти к следующему раунду.

---

## Общие правила API

### Базовый префикс

Все endpoint-ы v1 имеют префикс:

```text
/api/v1
```

### Формат данных

- формат запросов и ответов: `application/json`
- даты передаются в ISO 8601
- идентификаторы передаются как `string`

### Общий подход к ответам

Для MVP API использует простой JSON без дополнительной обёртки `data/meta`,
если это не требуется пагинацией или batch-ответом.

Пример успешного ответа:

```json
{
  "id": "team_1",
  "name": "CSKA Moscow"
}
```

Пример ответа списка:

```json
{
  "items": [],
  "total": 0
}
```

### Общая форма ошибки

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Season not found",
  "details": {
    "seasonId": "season_404"
  }
}
```

### Базовые коды ошибок

- `400 Bad Request` — неверный формат запроса
- `404 Not Found` — сущность не найдена
- `409 Conflict` — действие недопустимо для текущего состояния
- `422 Unprocessable Entity` — валидация доменных правил не пройдена
- `503 Service Unavailable` — зависимость недоступна, например БД

---

## Общие DTO и сущности ответа

### TeamSummaryDto

```json
{
  "id": "team_cska",
  "name": "CSKA Moscow",
  "city": "Moscow",
  "shortName": "CSKA",
  "rating": 88
}
```

### TeamDetailsDto

```json
{
  "id": "team_cska",
  "name": "CSKA Moscow",
  "city": "Moscow",
  "shortName": "CSKA",
  "rating": 88,
  "players": [],
  "createdAt": "2026-05-01T10:00:00.000Z",
  "updatedAt": "2026-05-01T10:00:00.000Z"
}
```

### PlayerSummaryDto

```json
{
  "id": "player_1",
  "name": "Alex Carter",
  "age": 24,
  "position": "SG",
  "overall": 79,
  "potential": 85,
  "teamId": "team_cska"
}
```

### PlayerDetailsDto

```json
{
  "id": "player_1",
  "name": "Alex Carter",
  "age": 24,
  "position": "SG",
  "shooting": 82,
  "passing": 74,
  "defense": 70,
  "rebounding": 58,
  "athleticism": 81,
  "overall": 79,
  "potential": 85,
  "teamId": "team_cska",
  "createdAt": "2026-05-01T10:00:00.000Z",
  "updatedAt": "2026-05-01T10:00:00.000Z"
}
```

### MatchDto

```json
{
  "id": "match_101",
  "seasonId": "season_2026",
  "round": 12,
  "status": "COMPLETED",
  "homeTeam": {
    "id": "team_cska",
    "name": "CSKA Moscow",
    "shortName": "CSKA"
  },
  "awayTeam": {
    "id": "team_unics",
    "name": "UNICS Kazan",
    "shortName": "UNICS"
  },
  "homeScore": 84,
  "awayScore": 79,
  "winnerTeamId": "team_cska",
  "playedAt": "2026-05-01T18:00:00.000Z"
}
```

### SeasonDto

```json
{
  "id": "season_2026",
  "name": "VTB League MVP 2025/26",
  "status": "IN_PROGRESS",
  "currentRound": 12,
  "totalRounds": 40,
  "teamCount": 11,
  "startedAt": "2026-05-01T10:00:00.000Z",
  "finishedAt": null
}
```

### StandingsRowDto

```json
{
  "position": 1,
  "teamId": "team_cska",
  "teamName": "CSKA Moscow",
  "shortName": "CSKA",
  "gamesPlayed": 12,
  "wins": 10,
  "losses": 2,
  "winPercentage": 0.833
}
```

### CareerSaveDto

```json
{
  "id": "save_1",
  "name": "My Career",
  "teamId": "team_cska",
  "teamName": "CSKA Moscow",
  "seasonId": "season_2026",
  "currentRound": 12,
  "status": "ACTIVE",
  "createdAt": "2026-05-01T10:00:00.000Z",
  "updatedAt": "2026-05-01T10:00:00.000Z"
}
```

---

## Teams API

### `GET /api/v1/teams`

Возвращает список всех команд лиги.

#### Query params

- `search?: string`
- `limit?: number`
- `offset?: number`

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": "team_cska",
      "name": "CSKA Moscow",
      "city": "Moscow",
      "shortName": "CSKA",
      "rating": 88
    }
  ],
  "total": 11
}
```

#### Errors

- `400` — некорректные query params
- `503` — backend не может прочитать данные из БД

### `GET /api/v1/teams/:teamId`

Возвращает детальную информацию по одной команде.

#### Path params

- `teamId: string`

#### Response `200 OK`

`TeamDetailsDto`

#### Errors

- `404` — команда не найдена
- `503` — БД недоступна

### `GET /api/v1/teams/:teamId/players`

Возвращает состав конкретной команды.

#### Path params

- `teamId: string`

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": "player_1",
      "name": "Alex Carter",
      "age": 24,
      "position": "SG",
      "overall": 79,
      "potential": 85,
      "teamId": "team_cska"
    }
  ],
  "total": 12
}
```

#### Errors

- `404` — команда не найдена
- `503` — БД недоступна

---

## Players API

### `GET /api/v1/players`

Возвращает список игроков.

#### Query params

- `teamId?: string`
- `position?: "PG" | "SG" | "SF" | "PF" | "C"`
- `search?: string`
- `limit?: number`
- `offset?: number`

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": "player_1",
      "name": "Alex Carter",
      "age": 24,
      "position": "SG",
      "overall": 79,
      "potential": 85,
      "teamId": "team_cska"
    }
  ],
  "total": 132
}
```

#### Errors

- `400` — невалидные query params
- `503` — БД недоступна

### `GET /api/v1/players/:playerId`

Возвращает подробную карточку игрока.

#### Path params

- `playerId: string`

#### Response `200 OK`

`PlayerDetailsDto`

#### Errors

- `404` — игрок не найден
- `503` — БД недоступна

---

## Matches API

### `GET /api/v1/matches`

Возвращает список матчей с фильтрами.

#### Query params

- `seasonId: string`
- `round?: number`
- `teamId?: string`
- `status?: "SCHEDULED" | "COMPLETED"`

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": "match_101",
      "seasonId": "season_2026",
      "round": 12,
      "status": "COMPLETED",
      "homeTeam": {
        "id": "team_cska",
        "name": "CSKA Moscow",
        "shortName": "CSKA"
      },
      "awayTeam": {
        "id": "team_unics",
        "name": "UNICS Kazan",
        "shortName": "UNICS"
      },
      "homeScore": 84,
      "awayScore": 79,
      "winnerTeamId": "team_cska",
      "playedAt": "2026-05-01T18:00:00.000Z"
    }
  ],
  "total": 5
}
```

#### Errors

- `400` — отсутствует `seasonId` или query params невалидны
- `404` — сезон не найден
- `503` — БД недоступна

### `GET /api/v1/matches/:matchId`

Возвращает один матч.

#### Path params

- `matchId: string`

#### Response `200 OK`

`MatchDto`

#### Errors

- `404` — матч не найден
- `503` — БД недоступна

---

## Seasons API

### `GET /api/v1/seasons/:seasonId`

Возвращает состояние сезона.

#### Path params

- `seasonId: string`

#### Response `200 OK`

`SeasonDto`

#### Errors

- `404` — сезон не найден
- `503` — БД недоступна

### `GET /api/v1/seasons/:seasonId/rounds/:roundNumber`

Возвращает данные текущего раунда и матчи раунда.

#### Path params

- `seasonId: string`
- `roundNumber: number`

#### Response `200 OK`

```json
{
  "seasonId": "season_2026",
  "round": 12,
  "status": "COMPLETED",
  "matches": [
    {
      "id": "match_101",
      "seasonId": "season_2026",
      "round": 12,
      "status": "COMPLETED",
      "homeTeam": {
        "id": "team_cska",
        "name": "CSKA Moscow",
        "shortName": "CSKA"
      },
      "awayTeam": {
        "id": "team_unics",
        "name": "UNICS Kazan",
        "shortName": "UNICS"
      },
      "homeScore": 84,
      "awayScore": 79,
      "winnerTeamId": "team_cska",
      "playedAt": "2026-05-01T18:00:00.000Z"
    }
  ]
}
```

#### Errors

- `400` — `roundNumber` невалиден
- `404` — сезон или раунд не найден
- `503` — БД недоступна

### `POST /api/v1/seasons/:seasonId/rounds/:roundNumber/simulate`

Симулирует матчи указанного раунда.

#### Path params

- `seasonId: string`
- `roundNumber: number`

#### Request body `SimulateRoundRequestDto`

```json
{
  "force": false
}
```

#### Правила

- если раунд уже сыгран, повторная симуляция запрещена по умолчанию;
- `force` зарезервирован для внутренних или отладочных сценариев и в обычном MVP UI не используется.

#### Response `200 OK`

```json
{
  "seasonId": "season_2026",
  "round": 12,
  "status": "COMPLETED",
  "matches": [
    {
      "id": "match_101",
      "seasonId": "season_2026",
      "round": 12,
      "status": "COMPLETED",
      "homeTeam": {
        "id": "team_cska",
        "name": "CSKA Moscow",
        "shortName": "CSKA"
      },
      "awayTeam": {
        "id": "team_unics",
        "name": "UNICS Kazan",
        "shortName": "UNICS"
      },
      "homeScore": 84,
      "awayScore": 79,
      "winnerTeamId": "team_cska",
      "playedAt": "2026-05-01T18:00:00.000Z"
    }
  ],
  "standingsUpdated": true
}
```

#### Errors

- `400` — тело запроса невалидно
- `404` — сезон или раунд не найден
- `409` — раунд уже симулирован или сезон завершён
- `503` — БД или simulation engine недоступны

### `POST /api/v1/seasons/:seasonId/next-round`

Продвигает сезон к следующему раунду.

#### Path params

- `seasonId: string`

#### Request body

```json
{}
```

#### Response `200 OK`

```json
{
  "seasonId": "season_2026",
  "previousRound": 12,
  "currentRound": 13,
  "seasonStatus": "IN_PROGRESS"
}
```

#### Errors

- `404` — сезон не найден
- `409` — текущий раунд ещё не завершён или сезон уже закончился
- `503` — БД недоступна

---

## Standings API

### `GET /api/v1/seasons/:seasonId/standings`

Возвращает турнирную таблицу сезона.

#### Path params

- `seasonId: string`

#### Response `200 OK`

```json
{
  "seasonId": "season_2026",
  "updatedAt": "2026-05-01T18:05:00.000Z",
  "items": [
    {
      "position": 1,
      "teamId": "team_cska",
      "teamName": "CSKA Moscow",
      "shortName": "CSKA",
      "gamesPlayed": 12,
      "wins": 10,
      "losses": 2,
      "winPercentage": 0.833
    }
  ]
}
```

#### Errors

- `404` — сезон не найден
- `503` — БД недоступна

---

## Saves API

Концепция того, что именно считается прогрессом карьеры, описана в:

- [docs/career-save-concept-v1.md](/home/newuser/Documents/BM/docs/career-save-concept-v1.md:1)

### `GET /api/v1/saves`

Возвращает список сохранений карьеры.

#### Response `200 OK`

```json
{
  "items": [
    {
      "id": "save_1",
      "name": "My Career",
      "teamId": "team_cska",
      "teamName": "CSKA Moscow",
      "seasonId": "season_2026",
      "currentRound": 12,
      "status": "ACTIVE",
      "createdAt": "2026-05-01T10:00:00.000Z",
      "updatedAt": "2026-05-01T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### Errors

- `503` — БД недоступна

### `POST /api/v1/saves`

Создаёт новую карьеру.

#### Request body `CreateSaveRequestDto`

```json
{
  "name": "My Career",
  "teamId": "team_cska"
}
```

#### Правила валидации

- `name` обязателен
- `name` не должен быть пустой строкой
- `teamId` обязателен
- `teamId` должен ссылаться на существующую команду

#### Response `201 Created`

`CareerSaveDto`

#### Errors

- `400` — невалидный JSON или отсутствует обязательное поле
- `404` — выбранная команда не найдена
- `422` — имя сохранения не прошло доменную валидацию
- `503` — БД недоступна

### `GET /api/v1/saves/:saveId`

Возвращает одно сохранение.

#### Path params

- `saveId: string`

#### Response `200 OK`

`CareerSaveDto`

#### Errors

- `404` — сохранение не найдено
- `503` — БД недоступна

### `POST /api/v1/saves/:saveId/select`

Делает сохранение активным и возвращает его текущее состояние.

#### Path params

- `saveId: string`

#### Request body

```json
{}
```

#### Response `200 OK`

```json
{
  "save": {
    "id": "save_1",
    "name": "My Career",
    "teamId": "team_cska",
    "teamName": "CSKA Moscow",
    "seasonId": "season_2026",
    "currentRound": 12,
    "status": "ACTIVE",
    "createdAt": "2026-05-01T10:00:00.000Z",
    "updatedAt": "2026-05-01T10:00:00.000Z"
  },
  "season": {
    "id": "season_2026",
    "name": "VTB League MVP 2025/26",
    "status": "IN_PROGRESS",
    "currentRound": 12,
    "totalRounds": 40,
    "teamCount": 11,
    "startedAt": "2026-05-01T10:00:00.000Z",
    "finishedAt": null
  }
}
```

#### Errors

- `404` — сохранение не найдено
- `503` — БД недоступна

---

## DTO список для shared

Для `packages/shared` в рамках этого контракта логично вынести:

- `PlayerPosition`
- `TeamSummaryDto`
- `TeamDetailsDto`
- `PlayerSummaryDto`
- `PlayerDetailsDto`
- `MatchDto`
- `SeasonDto`
- `StandingsRowDto`
- `CareerSaveDto`
- `CreateSaveRequestDto`
- `SimulateRoundRequestDto`

---

## Минимальный обязательный набор endpoint-ов для MVP

Если реализовывать строго минимальный пользовательский цикл, обязательными являются:

1. `GET /api/v1/saves`
2. `POST /api/v1/saves`
3. `GET /api/v1/saves/:saveId`
4. `POST /api/v1/saves/:saveId/select`
5. `GET /api/v1/teams/:teamId`
6. `GET /api/v1/teams/:teamId/players`
7. `GET /api/v1/seasons/:seasonId`
8. `GET /api/v1/seasons/:seasonId/rounds/:roundNumber`
9. `POST /api/v1/seasons/:seasonId/rounds/:roundNumber/simulate`
10. `GET /api/v1/seasons/:seasonId/standings`
11. `POST /api/v1/seasons/:seasonId/next-round`

Остальные endpoint-ы v1 считаются важными, но могут быть реализованы вторым шагом без нарушения MVP-цикла.

---

## Naming Rules

- в путях использовать только множественное число: `teams`, `players`, `matches`, `seasons`, `standings`, `saves`
- в DTO использовать суффиксы `RequestDto`, `ResponseDto` только там, где это помогает отличать вход и выход
- доменные сущности именовать через `Team`, `Player`, `Season`, `Match`, `Round`, `CareerSave`
- не смешивать в контракте `career` и `save` как разные сущности: в MVP основной API-термин — `save`, а продуктовый смысл — `career save`

---

## Итог

`API Contract v1` задаёт единый baseline для:

- backend endpoint-ов;
- frontend интеграции;
- shared DTO;
- последующей реализации сезонов, календаря, таблицы и сохранений.

Этот контракт сознательно ориентирован на MVP и не включает:

- трансферы;
- финансы;
- плей-офф;
- расширенную матчевую статистику;
- аутентификацию пользователей;
- многопользовательский режим.
