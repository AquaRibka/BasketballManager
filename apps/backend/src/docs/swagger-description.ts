export const SWAGGER_API_GUIDE = `
## API guide

### Teams flow

1. Вызвать \`GET /teams\`, чтобы получить список команд лиги.
2. Вызвать \`GET /teams/{id}\`, чтобы получить карточку команды.
3. Вызвать \`GET /teams/{id}/players\`, чтобы получить состав команды в стабильном формате.
4. Для административных или seed-like сценариев использовать \`POST /teams\` и \`PATCH /teams/{id}\`.

### Season flow

Текущий backend уже документирует команды и игроков.
Полный season flow для MVP закреплён в \`API Contract v1\` и предполагает следующий порядок:

1. выбрать или создать сохранение;
2. получить активный сезон;
3. получить текущий раунд;
4. получить календарь матчей раунда;
5. после симуляции получить обновлённую таблицу.

### Simulation flow

Simulation flow в MVP строится так:

1. frontend получает состояние сезона и текущий раунд;
2. frontend инициирует симуляцию раунда;
3. backend вызывает simulation engine;
4. backend сохраняет результат матчей;
5. frontend перечитывает результаты и standings.

До полной реализации season endpoints этот flow остаётся целевым сценарием, а не завершённым API-набором.

### Error examples

- \`400 Bad Request\` — невалидный payload или path param, например неверный \`id\` или attribute вне DTO-диапазона.
- \`404 Not Found\` — команда или игрок не найдены.
- \`409 Conflict\` — конфликт бизнес-правил, например уникальность \`shortName\`.
- \`422 Unprocessable Entity\` — доменное правило нарушено, например \`overall > potential\`.
- \`503 Service Unavailable\` — БД или критическая зависимость недоступна.

### Current MVP coverage

Сейчас в Swagger полностью покрыты:

- \`/health\`
- \`/teams\`
- \`/teams/{id}\`
- \`/teams/{id}/players\`
- \`/players\`
- \`/players/{id}\`
`.trim();
