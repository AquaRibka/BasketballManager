# Wave 1 Execution Plan v1

## Цель документа

Этот документ переводит `Wave 1` из roadmap в исполнимый инженерный план.

Его задача:

- разложить `Core Player Systems` на конкретные этапы;
- определить порядок задач;
- указать затрагиваемые слои проекта;
- описать минимальные API и data changes;
- зафиксировать критерии приемки и тестовые проверки.

---

## Статус

Текущий статус документа: `draft`.

Приоритет: `P2`  
Эпик: `Post-MVP Backlog`  
Компонент: `Wave 1 Execution`  
Релиз: `Post-MVP`  
Спринт: `Future`

Важно:

- документ не означает, что реализацию нужно делать одним большим merge;
- этапы предполагают несколько безопасных incremental PR;
- каждый следующий шаг опирается на завершение предыдущего.

---

## Scope Wave 1

`Wave 1` включает:

- `player domain foundation`
- `season player stats`
- `overall recalculation on profile layer`
- `player development`
- `training`
- `fatigue -> simulation bridge`
- `development summary UI`

`Wave 1` не включает:

- draft;
- scouting;
- transfers;
- finance;
- contracts;
- auth/cloud saves.

---

## Главный результат Wave 1

После завершения волны проект должен уметь:

1. хранить игрока в profile-based модели как основной source of truth;
2. собирать season-level player stats;
3. после сезона изменять игроков через объяснимый development flow;
4. давать менеджеру training choice в течение сезона;
5. учитывать fatigue в матчевой готовности;
6. показывать игроку, почему рост/спад произошел.

---

## Последовательность реализации

Wave 1 лучше собирать в шесть этапов:

1. `Foundation Data Activation`
2. `Season Stat Pipeline`
3. `Overall Source Migration`
4. `Development Engine`
5. `Training + Fatigue`
6. `Frontend Summary + Controls`

---

## Stage 1. Foundation Data Activation

### Цель

Сделать новые player profile models реально используемыми,
а не просто подготовленными в Prisma.

### Что делаем

#### Prisma

Проверяем и при необходимости расширяем schema для активного использования:

- `PlayerTechnicalAttributes`
- `PlayerPhysicalProfile`
- `PlayerMentalAttributes`
- `PlayerTacticalAttributes`
- `PlayerHiddenAttributes`
- `PlayerHealthProfile`
- `PlayerPotentialProfile`
- `PlayerReputationProfile`

Добавляем недостающие поля только в объеме, нужном для `Wave 1`.

На этом этапе не надо пытаться сразу закрыть весь каталог post-MVP атрибутов.

#### Backend

Добавляем/выделяем:

- `PlayerProfilesService`
- `PlayerOverallService`
- profile mappers между Prisma и shared domain shapes

Нужно закрепить правило:

```text
backend читает player gameplay truth
из profile tables,
а не из legacy flat fields,
там где это уже возможно
```

#### Shared

Добавляем и стабилизируем:

- `PlayerIdentityShape`
- `PlayerAttributeSetShape`
- `PlayerHiddenAttributesShape`
- `PlayerPhysicalProfileShape`
- `PlayerProfileBundleShape`

#### Frontend

Пока без новых экранов.

Нужно только:

- не ломаться от расширенного player response;
- безопасно игнорировать hidden-only блоки;
- быть готовым к profile bundle response позже.

### Затронутые каталоги

- [prisma/schema.prisma](/home/newuser/Documents/BM/prisma/schema.prisma:1)
- `prisma/migrations/*`
- `packages/shared/src/*`
- `apps/backend/src/players/*`

### Deliverables

- profile services;
- shared player profile contract;
- migration/backfill, если нужны новые `Wave 1` поля;
- единый mapper `Prisma -> PlayerProfileBundle`.

### Acceptance

- у каждого игрока можно стабильно получить полный профиль;
- backend больше не зависит от случайного mix legacy/profile данных в новых сервисах;
- `overall` не считается в UI и не редактируется вручную.

---

## Stage 2. Season Stat Pipeline

### Цель

Собрать сезонный контекст игрока как отдельный слой данных,
чтобы development не работал “в пустоте”.

### Что делаем

#### Prisma

Добавляем:

- `PlayerSeasonStat`

Минимальные поля v1:

- `playerId`
- `seasonId`
- `teamId`
- `gamesPlayed`
- `gamesStarted`
- `minutesTotal`
- `minutesPerGame`
- `pointsTotal`
- `pointsPerGame`
- `reboundsTotal`
- `reboundsPerGame`
- `assistsTotal`
- `assistsPerGame`
- `stealsPerGame?`
- `blocksPerGame?`
- `turnoversPerGame?`
- `fgPct?`
- `threePct?`
- `ftPct?`
- `usageRole?`
- `updatedAt`

#### Backend

Добавляем:

- `PlayerSeasonStatsService`
- season stat aggregation hook inside match/season flow

Важно:

- stats должны обновляться через агрегирование результатов матчей;
- нельзя заводить параллельный “ручной” источник статистики.

#### Shared

Добавляем:

- `PlayerSeasonStatShape`
- `PlayerSeasonStatSummaryShape`

#### API

Минимум:

- `GET /players/:id/seasons/:seasonId/stats`
- optional `GET /saves/:id/players/development-context`

### Затронутые каталоги

- `apps/backend/src/matches/*`
- `apps/backend/src/seasons/*`
- `apps/backend/src/players/*`
- `packages/shared/src/*`
- `prisma/schema.prisma`

### Deliverables

- таблица сезонной статистики игрока;
- backend aggregation logic;
- API чтения stat context.

### Acceptance

- после симуляции раундов у игроков копится сезонная статистика;
- сезонные stats можно использовать без прямого чтения match logs в development-сервисе.

---

## Stage 3. Overall Source Migration

### Цель

Перенести truth `overall` на profile-based gameplay layer окончательно.

### Что делаем

#### Backend

`PlayerOverallService` должен стать единственным владельцем правил:

- как читаются атрибуты;
- как считается `overall`;
- когда выполняется recalculation;
- как синхронизируются team rating proxies.

Нужно:

- убрать новую бизнес-логику с зависимостью от legacy `Player.overall`;
- перевести create/update/development/train flows на профильный recalculation;
- оставить legacy fields только как временный compatibility layer, если это еще нужно.

#### Prisma

На этом этапе пока можно сохранить legacy поля,
но документировать их как `compatibility mirror`.

#### Shared

Добавить:

- `PlayerOverallBreakdownShape`
- optional `OverallCalculationVersion`

#### Simulation

Проверить, что simulation input собирается уже из профильного gameplay state.

### Deliverables

- единый service ownership;
- понятная точка вызова recalculation;
- compatibility mapping plan для старого `Player.overall`.

### Acceptance

- create/update/development используют одну и ту же overall-функцию;
- simulation получает актуальное значение из нового слоя;
- нет двух независимых формул `overall`.

---

## Stage 4. Development Engine

### Цель

Добавить post-season progression, объяснимый для игрока и безопасный для данных.

### Что делаем

#### Prisma

Добавляем:

- `PlayerDevelopmentSnapshot`

Минимальные поля:

- `playerId`
- `seasonId`
- `beforeOverall`
- `afterOverall`
- `beforeAttributes`
- `afterAttributes`
- `ageCurveFactor`
- `potentialFactor`
- `seasonStatsFactor`
- `trainingFactor`
- `randomFactor`
- `summaryLabel`
- `createdAt`

При необходимости breakdown можно хранить JSON-структурой в v1.

#### Backend

Добавляем:

- `PlayerDevelopmentService`
- `OffseasonOrchestrationService` или equivalent flow owner

Логика:

1. проверить, что сезон завершен;
2. загрузить всех игроков карьеры/лиги;
3. получить season stats;
4. получить hidden traits;
5. получить training modifiers;
6. рассчитать deltas;
7. обновить атрибуты;
8. пересчитать `overall`;
9. сохранить snapshots.

#### Shared

Добавляем:

- `PlayerDevelopmentSnapshotShape`
- `DevelopmentFactorBreakdown`
- `PlayerDevelopmentSummaryShape`

#### API

Нужны:

- `POST /saves/:id/offseason/development/run`
- `GET /saves/:id/offseason/development`

### Затронутые каталоги

- `apps/backend/src/players/*`
- `apps/backend/src/saves/*`
- `apps/backend/src/seasons/*`
- `packages/shared/src/*`
- `prisma/schema.prisma`

### Deliverables

- runnable offseason development flow;
- snapshot history;
- summary endpoint.

### Acceptance

- progression запускается только в корректной offseason-фазе;
- каждый игрок получает объяснимый результат;
- изменения можно показать в UI без повторного пересчета на клиенте.

---

## Stage 5. Training + Fatigue

### Цель

Добавить управляемую тренировку как сезонный выбор менеджера
и связать ее с fatigue и development modifiers.

### Что делаем

#### Prisma

Добавляем:

- `TrainingPlan`
- `PlayerTrainingAssignment`
- `TrainingEffectSnapshot`
- optional `PlayerTrainingState`

Минимальные поля:

- `focus`
- `intensity`
- `fatigueLevel`
- `developmentModifier`
- `effectiveFromRound`

#### Backend

Добавляем:

- `TrainingService`
- fatigue update hook в weekly/round loop

Важно разделить:

- `temporary readiness/fatigue state`
- `long-term post-season development impact`

#### Shared

Добавляем:

- `TrainingFocus`
- `TrainingIntensity`
- `TrainingPlanShape`
- `PlayerTrainingAssignmentShape`
- `FatigueStateShape`

#### Simulation

Нужно расширить simulation input:

- readiness modifier;
- fatigue penalty;
- optional conditioning bonus.

Правило:

- fatigue влияет на матч мягко;
- тренировка не двигает permanent attributes в момент матча.

#### API

Нужны:

- `GET /saves/:id/training`
- `PATCH /saves/:id/training`
- `PATCH /saves/:id/training/players/:playerId`

### Затронутые каталоги

- `packages/simulation-engine/*`
- `apps/backend/src/players/*`
- `apps/backend/src/seasons/*`
- `apps/backend/src/saves/*`
- `packages/shared/src/*`
- `prisma/schema.prisma`

### Deliverables

- training state storage;
- fatigue-aware simulation bridge;
- management API.

### Acceptance

- у команды есть активный training plan;
- fatigue реально влияет на readiness;
- development получает training modifier один раз и только в одном месте.

---

## Stage 6. Frontend Summary + Controls

### Цель

Дать пользователю видимый и управляемый интерфейс для новых систем Wave 1.

### Что делаем

#### Frontend

Добавляем два базовых UX-сценария:

1. `Training control`
2. `Season development summary`

#### Training control UI

Минимум:

- выбор focus;
- выбор intensity;
- список игроков с fatigue indicator;
- optional override для 1-2 игроков.

#### Development summary UI

Минимум:

- список игроков после сезона;
- `before -> after overall`;
- несколько причин изменения;
- группировка на `improved / unchanged / declined`.

#### Backend/API support

Нужно убедиться, что frontend получает:

- готовый summary;
- explanation labels;
- не raw hidden data.

### Затронутые каталоги

- `apps/frontend/src/pages/*`
- `apps/frontend/src/shared/api/*`
- `packages/shared/src/*`

### Deliverables

- training page/panel;
- offseason development summary page/panel;
- API integration.

### Acceptance

- пользователь может изменить training plan без админского UI;
- после сезона видит понятный результат развития состава;
- UI не раскрывает hidden truth сверх задуманного.

---

## Порядок PR / implementation batches

Чтобы не раздувать один огромный diff, стоит идти так:

### PR 1

- shared player profile contracts
- backend profile mappers/services
- small Prisma additions if needed

### PR 2

- `PlayerSeasonStat`
- stat aggregation
- stats read API

### PR 3

- `PlayerOverallService`
- migration of overall truth
- simulation input sync

### PR 4

- `PlayerDevelopmentSnapshot`
- `PlayerDevelopmentService`
- offseason development endpoints

### PR 5

- `TrainingPlan`
- `TrainingService`
- fatigue in simulation

### PR 6

- frontend training UI
- frontend development summary UI

---

## Зависимости между задачами

### Hard dependencies

- `Stage 2` зависит от `Stage 1`
- `Stage 3` зависит от `Stage 1`
- `Stage 4` зависит от `Stage 2` и `Stage 3`
- `Stage 5` зависит от `Stage 1` и частично от `Stage 3`
- `Stage 6` зависит от `Stage 4` и `Stage 5`

### Soft dependencies

- часть training UI можно готовить параллельно с backend API mocks;
- часть summary UI можно готовить после стабилизации shared contracts.

---

## Test plan для Wave 1

### Unit

Нужны тесты на:

- overall calculation;
- development factor composition;
- age curve outcomes;
- potential headroom behavior;
- training modifier application;
- fatigue penalty mapping.

### Integration

Нужны тесты на:

- season stat aggregation after match simulation;
- offseason development run;
- training update -> simulation input bridge;
- snapshot persistence.

### Regression

Обязательные проверки:

- текущий MVP season loop не сломан;
- save creation/load still works;
- standings and match simulation stay deterministic enough for existing tests;
- старые игроки корректно backfill-ятся в новых flow.

### Manual QA

Минимальный сценарий:

1. создать/загрузить карьеру;
2. выбрать training focus;
3. симулировать несколько раундов;
4. увидеть накопление fatigue;
5. завершить сезон;
6. запустить development;
7. увидеть summary изменений;
8. стартовать новый сезон без поломки save state.

---

## Основные риски Wave 1

### Риск 1. Legacy Player и profile layer расходятся

Нельзя допускать, чтобы:

- часть flow читала одно;
- часть flow читала другое.

Нужен явный owner и compatibility strategy.

### Риск 2. Stats pipeline слишком поздно появится

Тогда development либо станет бедным по логике,
либо начнет читать сырые матчи в неудобных местах.

### Риск 3. Training станет вторым development engine

Это приведет к двойному growth effect.

### Риск 4. Fatigue сделает матчевую модель слишком шумной

Поэтому penalty нужно вводить мягко и с clamp-правилами.

### Риск 5. UI случайно покажет hidden truth

Нужно отдавать summary и visibility-safe DTO,
а не прямые hidden profile values.

---

## Definition of Done для Wave 1

`Wave 1` можно считать завершенной, если:

1. profile-based player truth реально работает;
2. season player stats сохраняются и читаются;
3. `overall` считается единообразно;
4. offseason development запускается и сохраняет snapshots;
5. training/fatigue влияют на сезонный loop;
6. frontend дает usable control и summary;
7. MVP save/season flow остается рабочим.

---

## Короткий вывод

`Wave 1` нужно строить как переход от статического MVP player model
к живой сезонной системе игрока.

Правильный порядок такой:

1. активировать profile data;
2. собрать season stats;
3. закрепить owner для `overall`;
4. добавить development;
5. добавить training и fatigue;
6. только потом строить новый UI-слой.

Так мы получим первую по-настоящему “долгую” карьерную механику без лишней архитектурной тряски.
