# API Error Format

## Цель документа

Этот документ фиксирует единый формат ошибок API для MVP Basketball Manager.
Его задача — сделать так, чтобы:

- frontend одинаково обрабатывал любые ошибки;
- backend не возвращал разнородные shapes;
- validation, not found, conflict и internal errors выглядели предсказуемо.

---

## Единый error shape

Все ошибки API должны возвращаться в таком формате:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "errors": [
      {
        "field": "name",
        "messages": ["name should not be empty"]
      }
    ]
  },
  "path": "/teams",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

### Поля

- `statusCode` — HTTP статус
- `code` — стабильный машинный код ошибки
- `message` — короткое человекочитаемое описание
- `details` — дополнительные структурированные данные, если они есть
- `path` — URL запроса
- `timestamp` — время формирования ошибки в ISO 8601

---

## HTTP codes и machine codes

### Validation error

- HTTP: `400 Bad Request`
- `code`: `VALIDATION_ERROR`

Когда используется:

- пустые названия;
- некорректный `id`;
- неверная позиция игрока;
- атрибут вне диапазона DTO;
- лишние поля в payload.

### Not found

- HTTP: `404 Not Found`
- `code`: `NOT_FOUND`

Когда используется:

- команда не найдена;
- игрок не найден;
- связанная сущность не существует.

### Conflict

- HTTP: `409 Conflict`
- `code`: `CONFLICT`

Когда используется:

- нарушение уникальности;
- коллизия с уже существующим ресурсом.

### Unprocessable entity

- HTTP: `422 Unprocessable Entity`
- `code`: `UNPROCESSABLE_ENTITY`

Когда используется:

- DTO уже прошло базовую валидацию;
- но нарушено доменное правило, например `overall > potential`.

### Internal error

- HTTP: `500 Internal Server Error`
- `code`: `INTERNAL_ERROR`

Когда используется:

- неожиданное исключение;
- необработанная ошибка приложения.

### Service unavailable

- HTTP: `503 Service Unavailable`
- `code`: `SERVICE_UNAVAILABLE`

Когда используется:

- БД или обязательная зависимость недоступна.

---

## Validation messages

Для validation errors `details.errors` всегда содержит массив объектов:

```json
{
  "field": "shooting",
  "messages": ["shooting must not be greater than 100"]
}
```

### Правила

- `field` — имя поля запроса
- `messages` — массив сообщений по этому полю
- `message` на верхнем уровне всегда одинаковый:
  - `Request validation failed`

Это позволяет frontend:

- единообразно показывать общее сообщение;
- отдельно раскладывать ошибки по полям формы.

---

## Error examples

### Validation error

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": {
    "errors": [
      {
        "field": "position",
        "messages": ["position must be one of the following values: PG, SG, SF, PF, C"]
      }
    ]
  },
  "path": "/players",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

### Not found

```json
{
  "statusCode": 404,
  "code": "NOT_FOUND",
  "message": "Team not found",
  "details": null,
  "path": "/teams/cmon_missing",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

### Conflict

```json
{
  "statusCode": 409,
  "code": "CONFLICT",
  "message": "Team shortName must be unique",
  "details": null,
  "path": "/teams",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

### Internal error

```json
{
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "Internal server error",
  "details": null,
  "path": "/players",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

---

## Logging

### Что логировать

Backend должен логировать как минимум:

- все `5xx` ошибки;
- stack trace для неожиданных исключений;
- метод и путь запроса.

### Что не обязательно логировать как error

Ошибки `400`, `404`, `409`, `422` считаются ожидаемыми прикладными сценариями.
Их можно не писать как `error`, если не требуется отдельная аналитика.

### Текущее правило MVP

Глобальный exception filter логирует:

- `500`
- `503`
- любые другие `5xx`

---

## Где реализовано

Runtime-реализация находится в:

- [apps/backend/src/common/errors/api-exception.filter.ts](/home/newuser/Documents/BM/apps/backend/src/common/errors/api-exception.filter.ts:1)
- [apps/backend/src/common/errors/format-validation-errors.ts](/home/newuser/Documents/BM/apps/backend/src/common/errors/format-validation-errors.ts:1)
- [apps/backend/src/common/pipes/create-api-validation-pipe.ts](/home/newuser/Documents/BM/apps/backend/src/common/pipes/create-api-validation-pipe.ts:1)

---

## Итог

Единый формат ошибок API в MVP нужен, чтобы frontend всегда мог рассчитывать на один и тот же контракт:

- один shape;
- один набор верхнеуровневых полей;
- предсказуемые `code`;
- структурированные validation errors;
- централизованную обработку и логирование на backend.
