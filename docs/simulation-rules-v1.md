# Simulation Rules v1

## Цель документа

Этот документ собирает в одном месте основные правила MVP-симуляции:

- формулу `overall`;
- формулу `teamStrength`;
- логику генерации счета;
- правило работы `seed`;
- известные ограничения модели.

Он нужен как рабочая памятка для разработчика, который хочет менять коэффициенты
или структуру симуляции и при этом понимать последствия для:

- баланса матчей;
- воспроизводимости результатов;
- тестов;
- API/backend интеграции.

---

## Карта правил

В текущем MVP симуляция матча устроена так:

1. backend собирает `MatchSimulationInput`;
2. engine валидирует команды и игроков;
3. по игрокам считается `teamStrength`;
4. по составам строится профиль матча;
5. генерируются владения, эффективность и счет основного времени;
6. при ничьей разыгрываются overtime;
7. из финального счета восстанавливается командная статистика;
8. использованный `seed` возвращается наружу.

Главное практическое следствие:

- `overall` влияет на `teamStrength`;
- `teamStrength` влияет на эффективность и темп;
- темп и эффективность влияют на счет;
- `seed` фиксирует все random-решения в этой цепочке.

---

## Overall v1

### Назначение

`overall` нужен как компактная оценка текущей силы игрока.
Он используется:

- как часть состава в `teamStrength`;
- как fallback-метрика для глубины и пустых позиций;
- как один из главных input-параметров seed/test сценариев.

### Входы

В формуле участвуют:

- `shooting`
- `passing`
- `defense`
- `rebounding`
- `stamina`
- `position`

В MVP пока действует временное правило:

```text
stamina = athleticism
```

То есть backend и engine должны считать, что `athleticism` временно заменяет отдельное поле `stamina`.

### Позиционные веса

#### `PG`

- `shooting`: `0.30`
- `passing`: `0.30`
- `defense`: `0.15`
- `rebounding`: `0.05`
- `stamina`: `0.20`

#### `SG`

- `shooting`: `0.32`
- `passing`: `0.22`
- `defense`: `0.16`
- `rebounding`: `0.08`
- `stamina`: `0.22`

#### `SF`

- `shooting`: `0.24`
- `passing`: `0.18`
- `defense`: `0.22`
- `rebounding`: `0.14`
- `stamina`: `0.22`

#### `PF`

- `shooting`: `0.16`
- `passing`: `0.12`
- `defense`: `0.28`
- `rebounding`: `0.24`
- `stamina`: `0.20`

#### `C`

- `shooting`: `0.10`
- `passing`: `0.10`
- `defense`: `0.30`
- `rebounding`: `0.30`
- `stamina`: `0.20`

### Формула

```text
overall =
  shooting * shootingWeight +
  passing * passingWeight +
  defense * defenseWeight +
  rebounding * reboundingWeight +
  stamina * staminaWeight
```

После этого:

1. результат округляется через `Math.round`;
2. итог ограничивается диапазоном `1..100`.

### Что изменится, если менять веса

- Изменение веса `passing` у `PG` и `SG` сразу влияет на ценность плеймейкеров.
- Усиление `defense` и `rebounding` у `PF/C` делает бигменов дороже не только в `overall`, но и дальше в `teamStrength`.
- Любое изменение `overall` меняет:
  - средний `overall` команды;
  - fallback по пустым позициям;
  - stamina/depth sorting в `teamStrength`.

То есть правка `overall` почти всегда тянет за собой перекалибровку матчевых результатов.

---

## TeamStrength v1

### Назначение

`teamStrength` — это агрегированная матч-специфичная сила команды.
Она нужна, чтобы сильный состав выигрывал чаще,
но не безусловно каждый раз.

### Компоненты

`teamStrength` складывается из:

- `team.rating`
- `averageOverall`
- `positionStrength`
- `attributeStrength`
- `staminaFactor`
- `randomFactor`

### 1. Average overall

Средний `overall` по всем игрокам состава:

```text
averageOverall = sum(player.overall) / players.length
```

Если состав пустой:

```text
averageOverall = 60
```

### 2. Position strength

Команда получает отдельный вклад по ролям стартовой пятерки:

- `PG`: `0.19`
- `SG`: `0.19`
- `SF`: `0.20`
- `PF`: `0.20`
- `C`: `0.22`

Для каждой позиции берется лучший игрок этой роли по `player role score`.
Если позиции нет, используется штрафной fallback:

```text
bestPlayerScore = averageOverall * 0.9
```

Это значит:

- сбалансированный состав оценивается лучше;
- даже сильный roster с дырой на позиции немного проседает.

### 3. Player role score

Это не `overall`, а отдельная позиционная оценка внутри `teamStrength`.

#### Role score weights

`PG`

- `shooting`: `0.28`
- `passing`: `0.32`
- `defense`: `0.14`
- `rebounding`: `0.06`
- `stamina`: `0.20`

`SG`

- `shooting`: `0.31`
- `passing`: `0.20`
- `defense`: `0.15`
- `rebounding`: `0.10`
- `stamina`: `0.24`

`SF`

- `shooting`: `0.22`
- `passing`: `0.16`
- `defense`: `0.20`
- `rebounding`: `0.16`
- `stamina`: `0.26`

`PF`

- `shooting`: `0.14`
- `passing`: `0.11`
- `defense`: `0.24`
- `rebounding`: `0.24`
- `stamina`: `0.27`

`C`

- `shooting`: `0.08`
- `passing`: `0.08`
- `defense`: `0.28`
- `rebounding`: `0.31`
- `stamina`: `0.25`

Идея здесь такая:

- `overall` отвечает за общую силу игрока;
- `player role score` отвечает за пригодность игрока именно к роли в матче.

### 4. Attribute strength

Средние базовые атрибуты состава:

```text
attributeStrength =
  shooting * 0.26 +
  passing * 0.18 +
  defense * 0.24 +
  rebounding * 0.16 +
  athleticism * 0.16
```

### 5. Stamina factor

Учитывается и вся команда, и top-8 по `overall`:

```text
staminaFactor =
  averageStamina * 0.65 +
  top8AverageStamina * 0.35
```

Если stamina отдельно не передана, используется `athleticism`.

### 6. Random factor

Для одного матча используется ограниченный random swing:

```text
randomFactor = (randomValue - 0.5) * 5
```

Диапазон:

```text
-2.5 .. +2.5
```

### Итоговая формула

```text
teamStrength =
  team.rating * 0.24 +
  averageOverall * 0.34 +
  positionStrength * 0.22 +
  attributeStrength * 0.12 +
  staminaFactor * 0.08 +
  randomFactor
```

После этого результат:

- округляется до `2` знаков;
- ограничивается диапазоном `1..100`.

### Что изменится, если менять коэффициенты

- Усиление `team.rating` приближает модель к ручной командной силе и ослабляет влияние реального состава.
- Усиление `averageOverall` делает симуляцию более линейной и менее чувствительной к positional fit.
- Усиление `positionStrength` увеличивает цену “правильной” стартовой пятерки.
- Усиление `randomFactor` увеличивает апсеты, но быстро ломает воспроизводимую иерархию силы на дистанции.
- Ослабление `staminaFactor` уменьшает ценность глубины состава и athleticism.

---

## Score Generation v1

### Общая идея

Счет не строится одним `random`.
Модель разбита на шаги:

1. профиль команд;
2. темп матча;
3. эффективность владений;
4. случайная вариативность;
5. overtime;
6. реконструкция командной статистики.

### 1. Team profile

Из состава команды берутся средние:

- `overall`
- `shooting`
- `passing`
- `defense`
- `rebounding`
- `athleticism`

Если roster пустой, для средних используется fallback `60`.

### 2. Pace model

Базовый темп матча:

```text
paceBase =
  90 +
  (homeAthleticism + awayAthleticism) / 16 +
  (homePassing + awayPassing) / 24 +
  (homeOverall + awayOverall) / 40
```

Дальше он ограничивается:

```text
basePossessions = clamp(round(paceBase), 86, 102)
```

Позиционный вклад темпа команды против соперника:

```text
paceModifier =
  (athleticism - 75) / 3.2 +
  (passing - 75) / 4.6 +
  (rebounding - opponentRebounding) / 10
```

С ограничением:

```text
-6 .. +6
```

Практическое следствие:

- быстрые, атлетичные и хорошо пасующие команды получают больше владений;
- разница в подборе тоже слегка двигает темп;
- даже быстрые команды не разгоняют матч бесконечно из-за clamp-ограничений.

### 3. Efficiency model

Домашняя и гостевая эффективность считаются отдельно.

#### Home efficiency

```text
homeEfficiency =
  0.95 +
  homeStrength / 260 +
  (homeShooting - awayDefense) / 300 +
  strengthDelta / 360
```

С ограничением:

```text
0.88 .. 1.28
```

#### Away efficiency

```text
awayEfficiency =
  0.93 +
  awayStrength / 260 +
  (awayShooting - homeDefense) / 300 -
  strengthDelta / 380
```

С ограничением:

```text
0.86 .. 1.24
```

Дополнительно считается execution modifier:

```text
homeExecutionModifier =
  (homeShooting - awayDefense) / 340 +
  (homePassing - awayDefense) / 520
```

```text
awayExecutionModifier =
  (awayShooting - homeDefense) / 340 +
  (awayPassing - homeDefense) / 520
```

Практический смысл:

- `teamStrength` двигает baseline качества команды;
- `shooting vs defense` влияет на shot efficiency;
- `passing` помогает реализации, но слабее, чем shooting.

### 4. Regulation score

Сначала генерируются владения:

```text
sharedPossessions =
  basePossessions +
  (homePaceModifier + awayPaceModifier) / 2 +
  random(-paceVariance, paceVariance)
```

где:

```text
paceVariance = 4.5
```

Потом владения делятся между командами:

```text
possessionSplit =
  (homePaceModifier - awayPaceModifier) * 0.55 +
  random(-2.2, 2.2)
```

После этого считается очков за владение:

```text
homePPP = homeEfficiency + homeExecutionModifier + random(-0.085, 0.085)
awayPPP = awayEfficiency + awayExecutionModifier + random(-0.085, 0.085)
```

И уже затем сам счет:

```text
homeScore = round(homePossessions * homePPP + random(-6.5, 6.5))
awayScore = round(awayPossessions * awayPPP + random(-6.5, 6.5))
```

С ограничениями:

- `homeScore`: `58..138`
- `awayScore`: `56..138`

Это даёт три важных свойства:

- темп и эффективность связаны со счетом;
- сильная команда не всегда забивает одно и то же число очков;
- результат не вырождается в “победил тот, у кого выше rating”.

### 5. Overtime

Если после основного времени счет равный, движок не делает искусственный `+1`.
Он разыгрывает отдельные overtime-периоды, пока победитель не появится.

Каждый overtime:

- берет короткий `overtimePace`;
- считает небольшой блок очков для обеих сторон;
- добавляет еще один random слой;
- слегка учитывает `strengthDelta`.

Практический смысл:

- в финальном результате ничьей быть не может;
- overtime остается матчевым событием, а не техдолговым костылем.

### 6. Team statistics reconstruction

После финального счета engine не хранит “сырые события владений”,
а восстанавливает командную статистику из:

- финального счета;
- числа владений;
- shooting/passing/defense профилей;
- дополнительной ограниченной вариативности.

Сейчас из счета выводятся:

- `points`
- `possessions`
- `fieldGoalsMade`
- `fieldGoalsAttempted`
- `fieldGoalPercentage`
- `threePointsMade`
- `threePointsAttempted`
- `freeThrowsMade`
- `freeThrowsAttempted`
- `assists`
- `rebounds`
- `turnovers`
- `steals`
- `blocks`
- `fouls`

Практический смысл:

- box score выглядит согласованным со счетом;
- это еще не possession-by-possession симуляция;
- статистика реалистична на MVP-уровне, но не претендует на play-by-play точность.

### Что изменится, если менять коэффициенты score generation

- Повышение `paceBase` или ослабление clamp сделает лигу более high-scoring.
- Повышение `PPP variance` (`0.085`) усилит разброс реализаций.
- Повышение финального score noise (`6.5`) приблизит результат к шуму и ослабит связь состава со счетом.
- Ослабление `shooting vs defense` коэффициентов сделает атаку и защиту менее различимыми.
- Увеличение overtime bonus усилит роль концовок и случайных tie-сценариев.

---

## Random Seed

### Что делает seed

`seed` фиксирует последовательность псевдослучайных чисел,
которые используются во всех match-level random решениях.

В текущем engine:

- строковый `seed` превращается в `uint32` через хеш;
- дальше используется простой детерминированный PRNG;
- один и тот же `input + seed` всегда дает один и тот же результат.

### Правило MVP

Если `seed` передан:

- симуляция должна быть воспроизводимой;
- это удобно для тестов, QA и отладки.

Если `seed` не передан:

- engine генерирует runtime seed через `randomUUID()`;
- использованный seed возвращается в `result.seed`.

### Практическое правило для backend

Если нужен детерминированный матч:

```text
seed = match.id
```

Если нужна живая случайная симуляция:

- backend может seed не передавать;
- но для повторяемой отладки стоит логировать `result.seed`.

### Что сломается, если менять seed-логику

- Любая замена hash-функции или PRNG изменит все snapshot-результаты тестов.
- Даже при тех же коэффициентах матчи начнут выдавать другие счетовые последовательности.
- Regression-тесты на детерминизм придется обновлять сознательно, а не “по пути”.

---

## Known Limits

Текущая MVP-модель имеет осознанные ограничения.

### 1. Нет possession-by-possession симуляции

Сейчас engine не моделирует каждое владение как отдельное событие.
Счет и статистика строятся по агрегированной модели.

Следствие:

- модель быстрая и воспроизводимая;
- но не подходит для детального play-by-play.

### 2. `athleticism` временно заменяет `stamina`

Это практичный MVP-компромисс, но он смешивает две разные сущности.

Следствие:

- изменение `athleticism` сейчас одновременно меняет:
  - pace;
  - staminaFactor;
  - часть overall/teamStrength.

### 3. Team rating все еще влияет на матч отдельно от состава

`team.rating` входит в `teamStrength` как самостоятельный коэффициент.

Следствие:

- команда может быть сильнее даже при схожем roster snapshot;
- если в будущем `team.rating` станет derived-метрикой от игроков,
  этот вклад, возможно, придется ослабить или убрать.

### 4. Статистика матча выводится из счета, а не из событий

Это значит, что `FG%`, `assists`, `rebounds` и другие поля согласованы со счетом,
но не обязательно отражают точную “историю” матча.

### 5. Clamp-границы задают лиге искусственный коридор

Многие метрики ограничены сверху и снизу:

- possessions;
- efficiency;
- scores;
- rebounds;
- fouls;
- turnovers.

Следствие:

- модель защищена от абсурдных выбросов;
- но экстремальные команды в MVP не смогут сильно выйти за рамки лиги.

### 6. Пустой состав допустим

Engine умеет симулировать матч даже без roster.

Следствие:

- это удобно для edge-case тестов и ранних интеграций;
- но такие результаты стоит считать fallback-режимом, а не полноценным реализмом.

---

## Где смотреть код и тесты

Основная реализация:

- [packages/simulation-engine/src/overall-v1.mjs](/home/newuser/Documents/BM/packages/simulation-engine/src/overall-v1.mjs:1)
- [packages/simulation-engine/src/team-strength-v1.mjs](/home/newuser/Documents/BM/packages/simulation-engine/src/team-strength-v1.mjs:1)
- [packages/simulation-engine/src/simulate-match.mjs](/home/newuser/Documents/BM/packages/simulation-engine/src/simulate-match.mjs:1)

Тесты:

- [packages/simulation-engine/test/overall-v1.test.mjs](/home/newuser/Documents/BM/packages/simulation-engine/test/overall-v1.test.mjs:1)
- [packages/simulation-engine/test/team-strength-v1.test.mjs](/home/newuser/Documents/BM/packages/simulation-engine/test/team-strength-v1.test.mjs:1)
- [packages/simulation-engine/test/simulate-match.test.mjs](/home/newuser/Documents/BM/packages/simulation-engine/test/simulate-match.test.mjs:1)

Связанные документы:

- [docs/overall-formula-v1.md](/home/newuser/Documents/BM/docs/overall-formula-v1.md:1)
- [docs/team-strength-formula-v1.md](/home/newuser/Documents/BM/docs/team-strength-formula-v1.md:1)
- [docs/simulation-contract-v1.md](/home/newuser/Documents/BM/docs/simulation-contract-v1.md:1)

---

## Итог

`Simulation Rules v1` фиксирует не только формулы,
но и причинно-следственную цепочку внутри MVP-движка:

- как игрок превращается в `overall`;
- как состав превращается в `teamStrength`;
- как сила и профиль команд превращаются в счет;
- как `seed` делает этот путь воспроизводимым.

Это главный документ, который стоит открыть перед изменением коэффициентов
или добавлением новой матчевой логики.
