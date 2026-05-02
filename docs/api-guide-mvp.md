# API Guide MVP

## Цель документа

Этот документ кратко объясняет основные сценарии использования API в MVP Basketball Manager.
Он нужен как дополнение к Swagger и `API Contract v1`, чтобы было понятно не только
какие endpoint-ы существуют, но и в каком порядке их обычно вызывать.

---

## Teams flow

Это основной уже реализованный пользовательский поток для чтения данных команды.

### Последовательность вызовов

1. `GET /teams`
2. `GET /teams/:id`
3. `GET /teams/:id/players`

### Зачем это нужно

- сначала frontend получает список доступных команд;
- затем загружает карточку выбранной команды;
- затем при необходимости отдельно перечитывает состав в стабильном формате roster endpoint-а.

### Когда использовать `POST /teams` и `PATCH /teams/:id`

Эти endpoint-ы нужны в MVP в первую очередь для:

- административного наполнения данных;
- внутренних инструментов;
- seed/debug сценариев;
- обновления команды без прямого редактирования базы.

---

## Season flow

Полный `season flow` уже закреплён в [docs/api-contract-v1.md](/home/newuser/Documents/BM/docs/api-contract-v1.md:1),
но ещё не реализован полностью в backend.

### Целевой порядок вызовов

1. выбрать или создать сохранение;
2. получить активный сезон;
3. получить текущий раунд;
4. получить список матчей раунда;
5. после завершения действий пользователя перечитать standings.

### Зачем это важно

Даже до полной реализации season endpoints Swagger должен показывать,
как будущие ресурсы будут встраиваться в уже существующие `teams` и `players`.

---

## Simulation flow

Simulation flow в MVP строится как orchestration со стороны backend.

### Целевой порядок

1. frontend получает текущий сезон и раунд;
2. frontend отправляет команду на симуляцию;
3. backend вызывает `simulation engine`;
4. backend сохраняет результаты матчей;
5. frontend заново запрашивает результаты и standings.

### Важный принцип

`frontend` не считает матч сам.
Он только инициирует действие и читает обновлённое состояние через API.

---

## Error examples

### `400 Bad Request`

Когда возникает:

- невалидный `id` в path params;
- пустая строка там, где требуется имя;
- позиция игрока вне `PG/SG/SF/PF/C`;
- атрибут вне допустимого диапазона DTO.

Пример:

```json
{
  "message": ["shooting must not be greater than 100"],
  "error": "Bad Request",
  "statusCode": 400
}
```

### `404 Not Found`

Когда возникает:

- команда не найдена;
- игрок не найден;
- ссылка на связанную сущность указывает на несуществующую запись.

Пример:

```json
{
  "message": "Team not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### `409 Conflict`

Когда возникает:

- нарушено правило уникальности, например `Team.shortName`.

### `422 Unprocessable Entity`

Когда возникает:

- DTO уже прошло базовую валидацию, но нарушено доменное правило;
- пример: `overall > potential`.

Пример:

```json
{
  "message": "Player overall must be less than or equal to potential",
  "error": "Unprocessable Entity",
  "statusCode": 422
}
```

### `503 Service Unavailable`

Когда возникает:

- backend не может корректно обратиться к БД или другой обязательной зависимости.

---

## Current MVP coverage

Сейчас в Swagger и backend уже реально покрыты:

- `GET /health`
- `GET /teams`
- `GET /teams/:id`
- `GET /teams/:id/players`
- `POST /teams`
- `PATCH /teams/:id`
- `GET /players`
- `GET /players/:id`
- `POST /players`
- `PATCH /players/:id`

Полный `season / standings / simulation` сценарий уже описан архитектурно,
но ещё не завершён как runtime API.
