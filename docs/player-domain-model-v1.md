# Player Domain Model v1

## Цель документа

Этот документ фиксирует целевую структуру player-домена для этапа `Post-MVP`.

Его задача:

- описать сущности `Player`, `PlayerAttributeSet`, `PlayerHiddenAttributes`, `PlayerPhysicalProfile`, `PlayerCareerHistory`, `PlayerSeasonStat`, `PlayerSocialProfile`;
- определить их ответственность и связи;
- отделить игровые расчеты от справочных, медийных и исторических данных;
- дать устойчивую схему для дальнейшего роста БД и API без смешения доменных слоев.

---

## Статус

Текущий статус документа: `draft`.

Приоритет: `P2`  
Эпик: `Core Domain Expansion`  
Компонент: `Player Model`  
Релиз: `Post-MVP`  
Спринт: `Future`

Важно:

- это не обязательная миграция для MVP;
- документ фиксирует target model, а не требование реализовать всё сразу;
- rollout может идти поэтапно, начиная с минимального split текущей `Player`-сущности.

---

## Базовый принцип модели

Player-домен должен быть разделен по смысловым слоям.

Ключевое правило:

```text
Игровые расчетные данные,
скрытые development-данные,
физический профиль,
исторические записи
и социально-медийный слой
не должны жить как одна плоская таблица.
```

### Почему это важно

Если сложить всё в одну сущность `Player`, возникнут типичные проблемы:

- модель станет слишком широкой;
- будет трудно понять, что влияет на матч, а что только на UI и карьеру;
- исторические и сезонные данные начнут путаться с текущим состоянием;
- изменение одной подсистемы станет чаще трогать другие.

Поэтому целевая модель должна отвечать на разные вопросы разными сущностями:

- `Player` — кто это за игрок и где его текущая точка карьеры;
- `PlayerAttributeSet` — чем он умеет играть сейчас;
- `PlayerHiddenAttributes` — как он развивается и насколько стабилен;
- `PlayerPhysicalProfile` — какие у него физические и антропометрические параметры;
- `PlayerCareerHistory` — что с ним уже происходило в карьере;
- `PlayerSeasonStat` — что он показал в конкретном сезоне;
- `PlayerSocialProfile` — как его воспринимают вне паркета.

---

## 1. Player

### Роль сущности

`Player` — это корневая сущность игрока.

Она должна хранить:

- идентичность;
- текущую командную привязку;
- базовую карьерную позицию;
- ссылки на связанные профильные сущности.

### Что хранить в `Player`

Рекомендуемые поля:

- `id`
- `firstName`
- `lastName`
- `displayName`
- `nationality`
- `secondaryNationality?`
- `dateOfBirth`
- `age`
- `primaryPosition`
- `secondaryPositions?`
- `dominantHand?`
- `jerseyNumber?`
- `teamId?`
- `contractStatus`
- `isActive`
- `createdAt`
- `updatedAt`

### Что НЕ хранить в `Player`

Не стоит хранить прямо в `Player`:

- большой набор игровых атрибутов;
- скрытые development-поля;
- историю сезонов;
- социальную метрику;
- агрегированную карьерную статистику по сезонам;
- физический deep profile.

`Player` должен оставаться identity-root, а не огромным flat record.

---

## 2. PlayerAttributeSet

### Роль сущности

`PlayerAttributeSet` хранит текущий актуальный набор игровых атрибутов игрока.

Это именно active gameplay layer:

- то, что влияет на `overall`;
- то, что используется в симуляции матчей;
- то, что растет или снижается через development и training.

### Что хранить в `PlayerAttributeSet`

Рекомендуемые поля:

- `id`
- `playerId`
- `shooting`
- `passing`
- `defense`
- `rebounding`
- `athleticism`
- `midRangeShot?`
- `threePointShot?`
- `freeThrow?`
- `ballHandling?`
- `dribbling?`
- `rimFinishing?`
- `dunking?`
- `postMoves?`
- `perimeterDefense?`
- `interiorDefense?`
- `offensiveRebounding?`
- `defensiveRebounding?`
- `stamina?`
- `overall`
- `lastCalculatedAt?`
- `createdAt`
- `updatedAt`

### Почему `overall` здесь, а не в `Player`

`Overall` относится к текущему игровому качеству, а не к identity.

Поэтому логичнее держать его рядом с active attribute set.

Это позволяет:

- пересчитывать `overall` из атрибутов без смешения с историей;
- хранить future alternate sets при необходимости;
- ясно отделить current gameplay state от metadata.

### Правило ответственности

`PlayerAttributeSet` отвечает на вопрос:

```text
Как игрок играет сейчас?
```

---

## 3. PlayerHiddenAttributes

### Роль сущности

`PlayerHiddenAttributes` хранит внутренние системные параметры,
которые не должны смешиваться с открытым игровым профилем.

Это слой для:

- development;
- scouting;
- injuries;
- стабильности карьеры;
- долгосрочного разнообразия игроков.

### Что хранить в `PlayerHiddenAttributes`

Рекомендуемые поля:

- `id`
- `playerId`
- `potential`
- `growthRate`
- `learningAbility`
- `adaptability`
- `consistency`
- `injuryProneness`
- `peakAge`
- `declineResistance`
- `confidence`
- `composure`
- `workEthic`
- `professionalism`
- `leadership`
- `competitiveness`
- `teamOrientation`
- `loyalty`
- `ego`
- `clutchFactor`
- `basketballIQ`
- `decisionMaking`
- `shotSelection`
- `offBallAwareness`
- `helpDefenseAwareness`
- `pickAndRollRead`
- `playDiscipline`
- `foulDiscipline`
- `createdAt`
- `updatedAt`

### Почему hidden слой отдельно

Если эти поля положить в `PlayerAttributeSet`, то:

- scouting потеряет границу между “видимым” и “скрытым”;
- development начнет путаться с матчевыми скиллами;
- UI будет сложнее определять, что можно раскрывать пользователю.

### Правило ответственности

`PlayerHiddenAttributes` отвечает на вопрос:

```text
Как система внутренне оценивает рост,
стабильность и психологический профиль игрока?
```

---

## 4. PlayerPhysicalProfile

### Роль сущности

`PlayerPhysicalProfile` хранит антропометрию и физическое тело игрока.

Это отдельный слой, потому что физический профиль:

- не равен technical skill;
- нужен и для матчевой логики, и для injuries, и для скаутинга;
- развивается по иным законам, чем бросок или IQ.

### Что хранить в `PlayerPhysicalProfile`

Рекомендуемые поля:

- `id`
- `playerId`
- `heightCm`
- `weightKg`
- `wingspanCm?`
- `standingReachCm?`
- `bodyType?`
- `frame?`
- `speed`
- `acceleration`
- `strength`
- `agility`
- `balance?`
- `vertical?`
- `endurance?`
- `durability?`
- `recoveryRate?`
- `createdAt`
- `updatedAt`

### Почему это отдельно от `PlayerAttributeSet`

Даже если часть физических чисел влияет на матч,
это всё равно другой смысловой слой.

`PlayerAttributeSet` отвечает за basketball skill execution, а `PlayerPhysicalProfile` — за тело и athletic base.

Это полезно для:

- травм;
- aging;
- тренировок;
- scouting card layout;
- будущих role calculations.

### Правило ответственности

`PlayerPhysicalProfile` отвечает на вопрос:

```text
Каким телом и физическим фундаментом обладает игрок?
```

---

## 5. PlayerCareerHistory

### Роль сущности

`PlayerCareerHistory` хранит долгосрочный narrative и факты карьеры игрока.

Это не current gameplay state и не текущая сезонная статистика.

Это historical/reference layer.

### Что хранить в `PlayerCareerHistory`

Есть два хороших варианта.

#### Вариант A: одна summary-сущность

Поля:

- `id`
- `playerId`
- `yearsPro`
- `draftYear?`
- `draftPick?`
- `academyTeamId?`
- `careerTeamsCount`
- `titlesWon`
- `awardsCount`
- `careerStage`
- `careerNarrativeTags?`
- `createdAt`
- `updatedAt`

#### Вариант B: summary + timeline entries

Помимо summary вводить отдельную запись:

- `PlayerCareerHistoryEntry`

С полями:

- `id`
- `playerId`
- `seasonId?`
- `teamId?`
- `entryType`
- `title`
- `description`
- `createdAt`

Это лучше, если нужен настоящий timeline.

### Важное правило

История карьеры не должна использоваться как primary source для текущего расчета матча.

Она нужна для:

- UI;
- storytelling;
- scouting context;
- контрактной и трансферной логики;
- долгой памяти карьеры.

### Правило ответственности

`PlayerCareerHistory` отвечает на вопрос:

```text
Что уже произошло в карьере игрока?
```

---

## 6. PlayerSeasonStat

### Роль сущности

`PlayerSeasonStat` хранит статистику игрока за конкретный сезон.

Это историко-аналитическая сущность, привязанная к:

- `Player`
- `Season`
- опционально `Team`

### Что хранить в `PlayerSeasonStat`

Рекомендуемые поля:

- `id`
- `playerId`
- `seasonId`
- `teamId`
- `gamesPlayed`
- `gamesStarted`
- `minutesPerGame`
- `pointsPerGame`
- `reboundsPerGame`
- `assistsPerGame`
- `stealsPerGame`
- `blocksPerGame`
- `turnoversPerGame`
- `foulsPerGame`
- `fgPct`
- `threePct`
- `ftPct`
- `usageRate?`
- `assistRate?`
- `reboundRate?`
- `plusMinus?`
- `efficiencyRating?`
- `awardsJson?` или отдельная relation later
- `createdAt`
- `updatedAt`

### Почему это отдельная сущность

Сезонная статистика:

- меняется от сезона к сезону;
- относится к историческому отрезку;
- не должна перетирать текущую “вечную” карточку игрока.

Если держать сезонные цифры прямо в `Player`, будет неясно:

- это current season?
- last completed season?
- career average?

### Важное ограничение

`PlayerSeasonStat` не должен хранить gameplay attributes.

Он хранит результат сезона, а не skill definition игрока.

### Правило ответственности

`PlayerSeasonStat` отвечает на вопрос:

```text
Как игрок сыграл в конкретном сезоне?
```

---

## 7. PlayerSocialProfile

### Роль сущности

`PlayerSocialProfile` хранит медийный и публичный слой игрока.

Это отдельный слой, потому что он:

- почти не нужен для матча напрямую;
- может влиять на fan interest, sponsorship, reputation, morale events;
- относится к карьере и бренду игрока, а не к его on-court execution.

### Что хранить в `PlayerSocialProfile`

Рекомендуемые поля:

- `id`
- `playerId`
- `socialMediaPopularity`
- `publicImage`
- `controversyLevel`
- `brandValue`
- `communityPresence`
- `pressHandling`
- `fanAppeal`
- `starPower`
- `createdAt`
- `updatedAt`

### Почему не держать это в `Player`

Потому что это:

- не identity;
- не gameplay;
- не сезонная статистика;
- не биомеханика.

Это отдельный внеигровой career layer.

### Правило ответственности

`PlayerSocialProfile` отвечает на вопрос:

```text
Как игрок существует в публичном и медийном поле?
```

---

## 8. Связи между сущностями

### Базовая схема

Рекомендуемая структура связей:

```text
Team 1 --- * Player

Player 1 --- 1 PlayerAttributeSet
Player 1 --- 1 PlayerHiddenAttributes
Player 1 --- 1 PlayerPhysicalProfile
Player 1 --- 1 PlayerCareerHistory
Player 1 --- 1 PlayerSocialProfile

Player 1 --- * PlayerSeasonStat
Season 1 --- * PlayerSeasonStat
Team 1 --- * PlayerSeasonStat
```

### Практический смысл связей

`Player -> PlayerAttributeSet`

- один active gameplay profile на текущий момент времени.

`Player -> PlayerHiddenAttributes`

- один активный внутренний скрытый профиль.

`Player -> PlayerPhysicalProfile`

- один текущий физический профиль тела.

`Player -> PlayerCareerHistory`

- один summary history profile;
- timeline entries при необходимости можно расширить отдельно.

`Player -> PlayerSeasonStat`

- много сезонных записей по мере развития карьеры.

`Player -> PlayerSocialProfile`

- один актуальный публичный профиль.

---

## 9. Разделение расчетных и справочных данных

Это главный архитектурный принцип документа.

### Игровые расчетные данные

Должны жить в:

- `PlayerAttributeSet`
- `PlayerHiddenAttributes`
- `PlayerPhysicalProfile`

Потому что именно они участвуют в:

- `overall`;
- матчевой симуляции;
- training effects;
- player development;
- injuries;
- scouting uncertainty.

### Справочные и исторические данные

Должны жить в:

- `PlayerCareerHistory`
- `PlayerSeasonStat`
- `PlayerSocialProfile`

Потому что это:

- narrative layer;
- retrospective season records;
- public/media/business context.

### Что нельзя смешивать

Плохой вариант:

- хранить `pointsPerGame`, `careerAwards`, `instagramPopularity` и `threePointShot` в одной плоской модели `Player`.

Хороший вариант:

- держать skill-system отдельно;
- history отдельно;
- public layer отдельно;
- root identity отдельно.

---

## 10. Minimal Rollout

Рекомендуемый порядок внедрения:

1. `Player` + `PlayerAttributeSet`
2. `PlayerHiddenAttributes`
3. `PlayerPhysicalProfile`
4. `PlayerSeasonStat`
5. `PlayerCareerHistory`
6. `PlayerSocialProfile`

### Почему именно так

Первые три слоя нужны для собственно gameplay ecosystem.

Последние три слоя нужны скорее для:

- глубины карьеры;
- UI;
- рынка;
- narrative systems.

---

## Итог

Целевая player-модель должна строиться не вокруг одной перегруженной таблицы `Player`,
а вокруг корневой сущности игрока и нескольких связанных профилей.

Это позволяет:

- не смешивать игровой расчет и справочные данные;
- проще развивать simulation и development;
- безопаснее добавлять историю, медийность и рыночные механики;
- поддерживать ясные границы ответственности у каждой сущности.
