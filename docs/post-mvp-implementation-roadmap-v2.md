# Post-MVP Implementation Roadmap v2

## Цель документа

Этот документ переводит post-MVP концепты в практический roadmap реализации.

Его задача:

- разложить post-MVP развитие проекта по волнам;
- зафиксировать порядок внедрения модулей;
- указать, какие изменения потребуются в `Prisma`, `backend`, `frontend`, `shared` и `simulation`;
- описать зависимости между задачами;
- не допустить ситуации, когда фичи реализуются в правильной идее, но в неправильной очередности.

---

## Статус

Текущий статус документа: `draft`.

Приоритет: `P2`  
Эпик: `Post-MVP Backlog`  
Компонент: `Implementation Planning`  
Релиз: `Post-MVP`  
Спринт: `Future`

Важно:

- документ не заменяет отдельные concept docs;
- документ нужен как инженерный маршрут внедрения;
- roadmap предполагает поэтапный rollout, а не big-bang migration.

---

## Главный принцип roadmap

Post-MVP нужно строить не по принципу:

```text
добавим интересную фичу, а потом свяжем
```

а по принципу:

```text
сначала создаем устойчивое ядро данных и расчетов,
затем информационные и менеджерские системы,
затем поверх них рынок, социальный слой и облако
```

Поэтому roadmap идет в четыре волны:

1. `Core Player Systems`
2. `Talent Pipeline`
3. `Club Management Layer`
4. `Meta Layer`

---

## Общая карта волн

| Wave     | Фокус                                | Основной результат                                 |
| -------- | ------------------------------------ | -------------------------------------------------- |
| `Wave 1` | player domain, development, training | живая карьера с ростом, спадом и fatigue           |
| `Wave 2` | scouting, rookies, draft             | ежегодное обновление таланта и неполная информация |
| `Wave 3` | finance, contracts, transfers        | управленческие ограничения и движение игроков      |
| `Wave 4` | reputation, social, auth/cloud       | долгий meta-loop, ownership и облачные сейвы       |

---

## Wave 1. Core Player Systems

### Цель волны

Сделать игрока живой сущностью, которая:

- меняется со временем;
- зависит от возраста и сезона;
- может развиваться по-разному;
- имеет усталость и тренировочный контекст.

Это первый обязательный слой после MVP.

Без него карьера слишком статична, а остальные post-MVP системы теряют смысл.

### Что входит

- `player domain split`
- `player development`
- `training`
- `player season stats`
- `overall recalculation` уже на новом profile-слое

### Что НЕ входит

- трансферы;
- бюджеты;
- контракты;
- скаутинг внешнего рынка;
- облачные аккаунты.

---

### Wave 1A. Domain Foundation

#### Prisma

Нужно довести player model split до реально используемого состояния:

- начать использовать новые profile tables как рабочие, а не только как future schema;
- добавить:
  - `PlayerSeasonStat`
  - `PlayerCareerHistory`
  - `PlayerSocialProfile`
  - при необходимости `PlayerTrainingState`
  - при необходимости `PlayerDevelopmentSnapshot`

#### Backend

Добавить domain services:

- `PlayerProfilesService`
- `PlayerSeasonStatsService`
- `PlayerOverallService` как единый recalculation owner

Нужно перестать размазывать player truth между:

- плоским `Player`
- временными расчетами
- UI assumptions

#### Shared

Вынести и стабилизировать shape:

- `Player`
- `PlayerAttributeSet`
- `PlayerHiddenAttributes`
- `PlayerPhysicalProfile`
- `PlayerSeasonStat`
- `PlayerDevelopmentSnapshot`

#### Frontend

Пока без сложного UI.

Достаточно:

- уметь безопасно читать player profile blocks;
- не показывать hidden data напрямую;
- не зависеть от старого плоского shape там, где уже есть новый.

#### Exit criteria

- у каждого игрока есть рабочий profile-based source of truth;
- `overall` всегда derived;
- season stats можно сохранять по игроку и сезону;
- backend и frontend используют единые shapes.

---

### Wave 1B. Player Development

#### Backend

Добавить `PlayerDevelopmentService`, который выполняет post-season progression.

Его обязанности:

- загрузить текущий attribute set;
- загрузить hidden traits;
- прочитать возраст и сезонный контекст;
- применить age curve;
- применить potential headroom;
- применить season usage/performance;
- применить bounded random factor;
- обновить attributes;
- инициировать `overall` recalculation;
- сохранить explanation snapshot.

#### Prisma

Минимально нужны:

- `PlayerDevelopmentSnapshot`
- `developmentReasonBreakdown`
- ссылка на `seasonId`

#### Shared

Нужны общие типы:

- `DevelopmentFactorBreakdown`
- `PlayerDevelopmentResult`
- `AgeCurveBand`

#### Frontend

Первый UI-уровень:

- экран или блок “Season Development Summary”
- рост/спад по игрокам
- объяснимые причины изменения

#### API

Нужны endpoint-ы уровня:

- `POST /saves/:id/offseason/development/run`
- `GET /saves/:id/offseason/development/summary`

#### Exit criteria

- после сезона игроки меняются объяснимо;
- изменения сохраняются как отдельный domain event;
- `overall` не редактируется вручную после progression.

---

### Wave 1C. Training

#### Backend

Добавить `TrainingService`.

Он должен управлять:

- team training plan;
- optional player assignment overrides;
- fatigue accumulation;
- development modifiers.

#### Prisma

Минимальные сущности:

- `TrainingPlan`
- `PlayerTrainingAssignment`
- `TrainingEffectSnapshot`

#### Simulation

Нужно добавить чтение readiness/fatigue modifier в simulation input.

Важно:

- fatigue должен влиять на матч мягко;
- сам рост атрибутов не должен происходить в момент матча.

#### API

Нужны endpoint-ы:

- `GET /saves/:id/training`
- `PATCH /saves/:id/training`
- `PATCH /saves/:id/training/players/:playerId`

#### Frontend

Нужен компактный workflow:

- выбор focus;
- выбор intensity;
- просмотр усталости и влияния на рост.

#### Exit criteria

- у менеджера есть реальный weekly choice;
- fatigue учитывается в season loop;
- development видит training как modifier, а не как отдельный ростовой движок.

---

## Wave 2. Talent Pipeline

### Цель волны

Сделать лигу самовоспроизводящейся:

- молодые игроки ежегодно появляются;
- пользователь не знает о них все сразу;
- драфт становится инструментом роста слабых команд;
- rebuilding начинает работать как долгий цикл.

### Что входит

- `rookie generation`
- `scouting`
- `draft`
- rookie integration into player domain

---

### Wave 2A. Rookie Generation

#### Backend

Добавить `RookieGenerationService`.

Он должен:

- генерировать draft class на межсезонье;
- создавать prospects отдельно от active league players;
- наполнять hidden traits, physical profile и base attributes.

#### Prisma

Минимальные сущности:

- `DraftClass`
- `DraftProspect`
- `ProspectAttributeSet`
- `ProspectHiddenAttributes`

#### Shared

Типы:

- `DraftClassSummary`
- `DraftProspectSummary`
- `ProspectVisibilityState`

#### Exit criteria

- на каждый новый offseason появляется rookie pool;
- prospects существуют до выбора на драфте как отдельная сущность, а не как обычный `Player`.

---

### Wave 2B. Scouting

#### Backend

Добавить `ScoutingService`.

Он должен:

- вести watchlist;
- генерировать scout reports;
- считать confidence / knowledge depth;
- выдавать пользователю partial information.

#### Prisma

Минимальные сущности:

- `ScoutingTarget`
- `ScoutReport`
- `ProspectVisibilitySnapshot`

#### API

Нужны endpoint-ы:

- `GET /saves/:id/scouting/board`
- `POST /saves/:id/scouting/targets`
- `GET /saves/:id/scouting/reports/:prospectId`

#### Frontend

Нужны:

- scouting board;
- карточка проспекта;
- watchlist;
- confidence indicators.

#### Exit criteria

- пользователь не видит точный hidden truth у всех проспектов;
- scouting меняет знание, а не actual attributes.

---

### Wave 2C. Draft

#### Backend

Добавить `DraftService`.

Он должен:

- определить порядок выбора;
- провести picks;
- привязать prospects к командам;
- конвертировать `DraftProspect` в `Player`;
- создать rookie contracts / baseline salaries.

#### Prisma

Минимальные сущности:

- `DraftPick`
- `DraftSelectionLog`

#### API

Нужны endpoint-ы:

- `GET /saves/:id/draft`
- `POST /saves/:id/draft/run`
- `GET /saves/:id/draft/results`

#### Frontend

Нужны:

- draft board;
- порядок выбора;
- список доступных игроков;
- итоговый recap.

#### Exit criteria

- слабые команды получают новый talent inflow;
- драфт завершает offseason talent pipeline;
- rookie players входят в общий player domain корректно.

---

## Wave 3. Club Management Layer

### Цель волны

Добавить ограничения и решения по составу.

После этой волны пользователь управляет не только силой игроков,
но и ресурсами клуба и движением состава.

### Что входит

- `finance`
- `contracts`
- `transfer value`
- `transfers`
- roster constraints

---

### Wave 3A. Finance Foundation

#### Backend

Добавить `FinanceService`.

Он должен считать:

- season budget;
- payroll;
- income;
- expenses;
- available flexibility.

#### Prisma

Минимальные сущности:

- `TeamFinanceProfile`
- `SeasonFinance`
- `FinanceLedgerEntry`

#### Shared

Типы:

- `FinanceSnapshot`
- `PayrollSummary`
- `BudgetStatus`

#### API

Нужны endpoint-ы:

- `GET /saves/:id/finance`
- `GET /saves/:id/finance/ledger`

#### Frontend

Нужны:

- finance dashboard;
- payroll list;
- предупреждения по ограничениям.

#### Exit criteria

- у клуба есть реальная финансовая рамка;
- future roster actions можно валидировать через finance.

---

### Wave 3B. Contracts

#### Backend

Добавить `ContractsService`.

Он должен хранить:

- salary amount;
- years remaining;
- status контракта;
- возможность rookie baseline deals.

#### Prisma

Минимальные сущности:

- `PlayerContract`
- optional `ContractOffer`

#### API

Нужны endpoint-ы:

- `GET /players/:id/contract`
- `PATCH /players/:id/contract`

#### Exit criteria

- зарплата игрока живет в контрактной сущности;
- finance не хранит salary как абстрактный loose field.

---

### Wave 3C. Transfer System

#### Backend

Добавить:

- `TransferWindowService`
- `PlayerValuationService`
- `TransferService`

Они должны:

- определять открыт ли рынок;
- считать market value;
- валидировать budget / payroll / roster limits;
- менять `teamId`;
- сохранять историю сделки.

#### Prisma

Минимальные сущности:

- `TransferWindow`
- `Transfer`
- `PlayerValuation`

#### API

Нужны endpoint-ы:

- `GET /saves/:id/transfers/window`
- `GET /saves/:id/transfers/market`
- `POST /saves/:id/transfers`
- `GET /saves/:id/transfers/history`

#### Frontend

Нужны:

- market table;
- фильтры по позиции и цене;
- сделка и подтверждение;
- история переходов.

#### Exit criteria

- сделки ограничены финансами и окном;
- roster moves не ломают season loop;
- team strength и payroll обновляются сразу после сделки.

---

## Wave 4. Meta Layer

### Цель волны

Добавить долгий meta-loop:

- медийность;
- narrative;
- ownership сохранений;
- облачную синхронизацию.

### Что входит

- `reputation`
- `social`
- `auth`
- `cloud saves`

---

### Wave 4A. Reputation / Social

#### Backend

Добавить `ReputationService`.

Он должен:

- обновлять social profile signals;
- считать star power / public image changes;
- отдавать narrative-friendly summaries.

#### Prisma

Минимальные сущности:

- использовать уже введенный `PlayerSocialProfile`
- optional `SocialEventLog`

#### API

Нужны endpoint-ы:

- `GET /players/:id/social`
- `GET /saves/:id/news` или similar narrative feed

#### Exit criteria

- social layer влияет на presentation и optional finance modifiers;
- social layer не меняет match attributes напрямую.

---

### Wave 4B. Auth / Cloud Saves

#### Backend

Добавить:

- `User`
- auth flow
- ownership checks
- cloud persistence around current `CareerSave`

#### Prisma

Минимальные сущности:

- `User`
- `CareerSave.ownerUserId`
- optional auth/session tables depending on chosen stack

#### API

Нужны endpoint-ы:

- `POST /auth/register`
- `POST /auth/login`
- `GET /me/saves`
- `POST /me/saves`

#### Frontend

Нужны:

- auth entry screens;
- save list;
- current local-to-cloud migration flow.

#### Exit criteria

- один и тот же domain save можно надежно хранить в облаке;
- auth не ломает локальный карьерный state machine.

---

## Технические зависимости по слоям

## Prisma-first зависимости

Ниже то, что лучше вводить через schema/data foundation до UI:

1. `PlayerSeasonStat`
2. `PlayerCareerHistory`
3. `PlayerSocialProfile`
4. `TrainingPlan`
5. `PlayerDevelopmentSnapshot`
6. `DraftClass / DraftProspect`
7. `ScoutingTarget / ScoutReport`
8. `TeamFinanceProfile / SeasonFinance`
9. `PlayerContract`
10. `TransferWindow / Transfer / PlayerValuation`
11. `User / save ownership`

## Shared-first зависимости

До большого UI полезно заранее вынести в `shared`:

- player profile groups;
- development result DTO;
- training DTO;
- scouting/draft DTO;
- finance snapshot DTO;
- transfer summary DTO;
- auth/save ownership DTO.

## Backend-first зависимости

Раньше, чем рисовать сложные экраны, стоит стабилизировать сервисы:

- development orchestration;
- training orchestration;
- offseason pipeline;
- draft pipeline;
- finance validation;
- transfer validation.

## Frontend-last правило

Для большинства post-MVP модулей правильнее идти так:

```text
schema -> shared contract -> backend service -> API -> frontend screen
```

А не наоборот.

---

## Рекомендуемая реализация по milestones

### Milestone A

- завершить player domain split
- перенести `overall` truth на profile layer
- добавить `PlayerSeasonStat`

### Milestone B

- добавить post-season development
- добавить training + fatigue
- показать development summary в UI

### Milestone C

- добавить rookie generation
- добавить scouting board
- добавить draft flow

### Milestone D

- добавить finance snapshot
- добавить contracts
- добавить transfer market

### Milestone E

- добавить reputation/social layer
- добавить auth/cloud saves

---

## Самые рискованные места

### Риск 1. Слишком ранний рынок игроков

Если начать с трансферов раньше finance/contracts,
рынок получится либо слишком аркадным, либо очень грязным в коде.

### Риск 2. Плоский player model продолжает жить параллельно новой

Если новая profile-based модель появится, но старая останется рабочим source of truth,
проект быстро получит двойную доменную реальность.

### Риск 3. Training и development начнут дублировать effect

Нельзя давать тренировке permanent skill growth на том же уровне,
на котором потом работает season-end development.

### Риск 4. Scouting начнет светить hidden truth

Если convenience API случайно отдает настоящий `potential`,
вся ценность scouting-слоя размывается.

### Риск 5. Auth слишком рано начнет переписывать save layer

Сначала должна стабилизироваться сама карьерная модель.
Только потом стоит добавлять ownership и cloud sync.

---

## Definition of Ready для каждой волны

Перед стартом новой волны желательно проверить:

- есть ли согласованный concept doc;
- есть ли data ownership по сущностям;
- есть ли shared contract plan;
- понятно ли, какой backend service владеет расчетом;
- не появится ли дублирование уже существующего state.

---

## Definition of Done для каждой волны

Волну можно считать завершенной, если:

1. есть Prisma schema/migrations;
2. есть shared contract;
3. есть backend service orchestration;
4. есть API layer;
5. есть минимальный usable frontend flow;
6. есть regression checks для season/save integrity.

---

## Короткий вывод

Если реализовывать post-MVP по этому roadmap, проект будет расти так:

1. сначала игроки станут живыми;
2. затем лига получит приток нового таланта;
3. затем появится настоящий менеджерский выбор по составу;
4. и только потом поверх этого добавятся meta systems.

Это самый устойчивый маршрут, потому что каждый следующий слой опирается на уже понятную доменную базу, а не пытается заменить её на ходу.
