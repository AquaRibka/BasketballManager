# Player Attributes Catalog v1

## Цель документа

Этот документ фиксирует полный каталог характеристик игрока для долгосрочной модели Basketball Manager.

Его задача:

- собрать в одном месте все группы player-данных;
- определить формат, диапазоны и смысл каждого поля;
- разделить открытые и скрытые атрибуты;
- дать опорную схему для `simulation`, `development`, `scouting`, `injuries`, `transfers`, `finance` и UI;
- избежать хаотичного разрастания player-модели в разных документах и модулях.

---

## Статус

Текущий статус документа: `draft`.

Приоритет: `P2`  
Эпик: `Core Domain Expansion`  
Компонент: `Player Model`  
Релиз: `Post-MVP`  
Спринт: `Future`

Важно:

- это не обязательный scope для MVP;
- не все поля должны появиться в БД сразу;
- документ фиксирует целевой каталог, который можно вводить поэтапно.

---

## Базовые правила каталога

### Единый принцип шкал

Чтобы система была удобной для баланса, рекомендуются такие базовые шкалы:

- игровые и скрытые атрибуты: `1..100`
- статусные модификаторы и риски: `0..100`
- возраст: полные годы
- рост: сантиметры
- вес: килограммы
- репутационные и медийные показатели: `0..100`
- счетчики карьеры и статистики: `0+`

### Видимость

У каждого поля должна быть одна из ролей:

- `visible` — видно пользователю напрямую;
- `derived` — вычисляется из других полей;
- `hidden` — используется системой и скаутингом, но не раскрывается полностью;
- `meta` — справочное, историческое или идентификационное поле.

### Важное правило

Не все поля должны участвовать в матче напрямую.

Часть каталога нужна для:

- симуляции;
- роста игрока;
- стоимости на рынке;
- контрактных решений;
- травм;
- скаутинга;
- сторителлинга карьеры.

---

## 1. Identity And Metadata

| Поле                   | Тип              | Диапазон                      | Видимость | Назначение                                     |
| ---------------------- | ---------------- | ----------------------------- | --------- | ---------------------------------------------- |
| `id`                   | string           | cuid/uuid                     | meta      | Уникальный идентификатор игрока                |
| `firstName`            | string           | 1..80 chars                   | visible   | Имя игрока                                     |
| `lastName`             | string           | 1..80 chars                   | visible   | Фамилия игрока                                 |
| `displayName`          | string           | 1..160 chars                  | visible   | Отображаемое полное имя                        |
| `nationality`          | enum/string      | ISO country or domain enum    | visible   | Гражданство                                    |
| `secondaryNationality` | enum/string/null | optional                      | visible   | Второе гражданство                             |
| `dateOfBirth`          | date             | valid date                    | meta      | Дата рождения                                  |
| `age`                  | int              | `16..45`                      | visible   | Возраст в годах                                |
| `dominantHand`         | enum             | `LEFT / RIGHT / AMBIDEXTROUS` | hidden    | Будущий influence на finishing/shooting flavor |
| `primaryPosition`      | enum             | `PG / SG / SF / PF / C`       | visible   | Основная позиция                               |
| `secondaryPositions`   | array enum       | subset of positions           | visible   | Допустимые вторичные позиции                   |
| `jerseyNumber`         | int              | `0..99`                       | visible   | Игровой номер                                  |
| `teamId`               | string/null      | valid id                      | visible   | Принадлежность команде                         |
| `contractStatus`       | enum             | active/future/free agent/etc  | visible   | Контрактный статус                             |

---

## 2. Anthropometry

| Поле              | Тип  | Диапазон                      | Видимость | Назначение                                                |
| ----------------- | ---- | ----------------------------- | --------- | --------------------------------------------------------- |
| `heightCm`        | int  | `165..230`                    | visible   | Рост для позиционного профиля, подбора, защиты, finishing |
| `weightKg`        | int  | `65..160`                     | visible   | Вес для физического профиля                               |
| `wingspanCm`      | int  | `170..245`                    | hidden    | Длина рук для contests, blocks, steals upside             |
| `standingReachCm` | int  | `210..310`                    | hidden    | Потолок влияния у кольца                                  |
| `bodyType`        | enum | slim/normal/strong/heavy/long | visible   | Визуальный и профильный тег                               |
| `frame`           | int  | `1..100`                      | hidden    | Потенциал набора мышц и физического развития              |

---

## 3. Physical Attributes

| Поле           | Тип | Диапазон | Видимость | Назначение                                               |
| -------------- | --- | -------- | --------- | -------------------------------------------------------- |
| `athleticism`  | int | `1..100` | visible   | Текущий umbrella-показатель физики для MVP-совместимости |
| `speed`        | int | `1..100` | visible   | Скорость перемещения                                     |
| `acceleration` | int | `1..100` | visible   | Первый шаг, резкость старта                              |
| `vertical`     | int | `1..100` | hidden    | Взрывность и игра above the rim                          |
| `strength`     | int | `1..100` | visible   | Контактная мощь, борьба, пост-эпизоды                    |
| `agility`      | int | `1..100` | visible   | Смена направления и мобильность                          |
| `balance`      | int | `1..100` | hidden    | Устойчивость под контактом                               |
| `stamina`      | int | `1..100` | visible   | Выносливость на длинной дистанции                        |
| `endurance`    | int | `1..100` | hidden    | Утомляемость между матчами и нагрузками                  |
| `durability`   | int | `1..100` | hidden    | Общая живучесть тела                                     |

---

## 4. Technical Skills

### Shooting

| Поле             | Тип | Диапазон | Видимость | Назначение                                               |
| ---------------- | --- | -------- | --------- | -------------------------------------------------------- |
| `shooting`       | int | `1..100` | visible   | Базовый umbrella-показатель броска для MVP-совместимости |
| `midRangeShot`   | int | `1..100` | visible   | Средний бросок                                           |
| `threePointShot` | int | `1..100` | visible   | Дальний бросок                                           |
| `freeThrow`      | int | `1..100` | visible   | Штрафные                                                 |
| `offDribbleShot` | int | `1..100` | hidden    | Бросок после ведения                                     |
| `catchAndShoot`  | int | `1..100` | hidden    | Бросок без лишнего дриблинга                             |
| `shotRelease`    | int | `1..100` | hidden    | Скорость/качество релиза                                 |

### Playmaking And Ball Skills

| Поле                  | Тип | Диапазон | Видимость | Назначение                                                 |
| --------------------- | --- | -------- | --------- | ---------------------------------------------------------- |
| `passing`             | int | `1..100` | visible   | Базовый umbrella-показатель передачи для MVP-совместимости |
| `ballHandling`        | int | `1..100` | visible   | Контроль мяча                                              |
| `dribbling`           | int | `1..100` | visible   | Работа с мячом под давлением                               |
| `courtVision`         | int | `1..100` | hidden    | Видение площадки                                           |
| `passAccuracy`        | int | `1..100` | hidden    | Точность передач                                           |
| `pickAndRollHandling` | int | `1..100` | hidden    | Игра как ball handler в PnR                                |

### Finishing

| Поле               | Тип | Диапазон | Видимость | Назначение                  |
| ------------------ | --- | -------- | --------- | --------------------------- |
| `rimFinishing`     | int | `1..100` | visible   | Реализация у кольца         |
| `layup`            | int | `1..100` | hidden    | Контроль простых завершений |
| `dunking`          | int | `1..100` | visible   | Данк-потенциал              |
| `contactFinishing` | int | `1..100` | hidden    | Очки через контакт          |
| `postMoves`        | int | `1..100` | visible   | Игра спиной к кольцу        |
| `postFootwork`     | int | `1..100` | hidden    | Работа ног в посте          |

### Defense And Rebounding

| Поле                  | Тип | Диапазон | Видимость | Назначение                                                |
| --------------------- | --- | -------- | --------- | --------------------------------------------------------- |
| `defense`             | int | `1..100` | visible   | Базовый umbrella-показатель защиты для MVP-совместимости  |
| `perimeterDefense`    | int | `1..100` | visible   | Защита на дуге                                            |
| `interiorDefense`     | int | `1..100` | visible   | Защита краски                                             |
| `stealAbility`        | int | `1..100` | hidden    | Потолок перехватов                                        |
| `blockAbility`        | int | `1..100` | hidden    | Потолок блок-шотов                                        |
| `screenNavigation`    | int | `1..100` | hidden    | Прохождение заслонов                                      |
| `switchDefense`       | int | `1..100` | hidden    | Полезность в switch-heavy scheme                          |
| `rebounding`          | int | `1..100` | visible   | Базовый umbrella-показатель подбора для MVP-совместимости |
| `offensiveRebounding` | int | `1..100` | visible   | Подбор в нападении                                        |
| `defensiveRebounding` | int | `1..100` | visible   | Подбор в защите                                           |
| `boxingOut`           | int | `1..100` | hidden    | Отсечение и позиционная борьба                            |

---

## 5. Tactical And IQ Attributes

| Поле                   | Тип | Диапазон | Видимость | Назначение                              |
| ---------------------- | --- | -------- | --------- | --------------------------------------- |
| `basketballIQ`         | int | `1..100` | hidden    | Общая игровая сообразительность         |
| `decisionMaking`       | int | `1..100` | hidden    | Качество решений с мячом и без          |
| `shotSelection`        | int | `1..100` | hidden    | Насколько игрок избегает плохих бросков |
| `helpDefenseAwareness` | int | `1..100` | hidden    | Чтение помощи в защите                  |
| `offBallAwareness`     | int | `1..100` | hidden    | Движение и выбор позиций без мяча       |
| `pickAndRollRead`      | int | `1..100` | hidden    | Чтение PnR-эпизодов                     |
| `spacingSense`         | int | `1..100` | hidden    | Качество spacing discipline             |
| `playDiscipline`       | int | `1..100` | hidden    | Следование установкам                   |
| `foulDiscipline`       | int | `1..100` | hidden    | Склонность к лишним фолам               |
| `transitionInstincts`  | int | `1..100` | hidden    | Игра в быстром переходе                 |

---

## 6. Psychological Attributes

| Поле              | Тип | Диапазон | Видимость | Назначение                            |
| ----------------- | --- | -------- | --------- | ------------------------------------- |
| `confidence`      | int | `1..100` | hidden    | Самоуверенность и влияние form swings |
| `composure`       | int | `1..100` | hidden    | Хладнокровие в важные моменты         |
| `workEthic`       | int | `1..100` | hidden    | Влияние на тренировки и развитие      |
| `professionalism` | int | `1..100` | hidden    | Стабильность карьеры и дисциплина     |
| `leadership`      | int | `1..100` | hidden    | Влияние на коллектив                  |
| `competitiveness` | int | `1..100` | hidden    | Игровой edge и fight                  |
| `teamOrientation` | int | `1..100` | hidden    | Склонность играть на систему          |
| `loyalty`         | int | `1..100` | hidden    | Влияние на переговоры и удержание     |
| `ego`             | int | `1..100` | hidden    | Риск конфликтов роли и минут          |
| `clutchFactor`    | int | `1..100` | hidden    | Возможная надбавка в late-game logic  |

---

## 7. Hidden Growth Attributes

| Поле                | Тип | Диапазон | Видимость      | Назначение                                 |
| ------------------- | --- | -------- | -------------- | ------------------------------------------ |
| `potential`         | int | `1..100` | hidden/partial | Потолок развития                           |
| `growthRate`        | int | `1..100` | hidden         | Темп, с которым игрок реализует potential  |
| `learningAbility`   | int | `1..100` | hidden         | Насколько эффективно усваивает тренировки  |
| `adaptability`      | int | `1..100` | hidden         | Привыкание к новой системе, роли, стране   |
| `consistency`       | int | `1..100` | hidden         | Волатильность выступлений от матча к матчу |
| `injuryProneness`   | int | `1..100` | hidden         | Риск травм при равной нагрузке             |
| `peakAge`           | int | `20..34` | hidden         | Ожидаемый пик карьеры                      |
| `declineResistance` | int | `1..100` | hidden         | Насколько мягко стареет игрок              |

---

## 8. Health And Availability

| Поле                       | Тип              | Диапазон                     | Видимость | Назначение                          |
| -------------------------- | ---------------- | ---------------------------- | --------- | ----------------------------------- |
| `healthStatus`             | enum             | healthy/questionable/out/etc | visible   | Текущее состояние доступности       |
| `fatigue`                  | int              | `0..100`                     | visible   | Накопленная усталость               |
| `matchFitness`             | int              | `0..100`                     | visible   | Готовность на ближайший матч        |
| `injuryRisk`               | int              | `0..100`                     | hidden    | Текущая вероятность травмы          |
| `recoveryRate`             | int              | `1..100`                     | hidden    | Скорость восстановления             |
| `chronicRisk`              | int              | `0..100`                     | hidden    | Долгосрочная медицинская уязвимость |
| `gamesMissedCurrentSeason` | int              | `0+`                         | visible   | Пропущенные матчи в сезоне          |
| `currentInjuryType`        | enum/string/null | optional                     | visible   | Тип текущей травмы                  |
| `estimatedReturnDate`      | date/null        | optional                     | visible   | Оценка возвращения                  |

---

## 9. Market And Reputation

| Поле                      | Тип         | Диапазон | Видимость       | Назначение                               |
| ------------------------- | ----------- | -------- | --------------- | ---------------------------------------- |
| `overall`                 | int         | `1..100` | derived         | Итоговая текущая сила игрока             |
| `playerValue`             | int/decimal | `0+`     | derived         | Рыночная стоимость                       |
| `reputation`              | int         | `1..100` | visible/partial | Узнаваемость и статус в лиге             |
| `leagueReputation`        | int         | `1..100` | hidden          | Вес внутри текущего чемпионата           |
| `internationalReputation` | int         | `1..100` | hidden          | Вес за пределами лиги                    |
| `starPower`               | int         | `1..100` | hidden          | Медийность и fan pull                    |
| `fanAppeal`               | int         | `1..100` | hidden          | Потенциал влияния на интерес аудитории   |
| `agentInfluence`          | int         | `1..100` | hidden          | Сложность переговоров и внешнее давление |

---

## 10. Social And Media Layer

| Поле                    | Тип | Диапазон | Видимость       | Назначение                             |
| ----------------------- | --- | -------- | --------------- | -------------------------------------- |
| `socialMediaPopularity` | int | `0..100` | visible/partial | Общая медийность в соцсетях            |
| `publicImage`           | int | `0..100` | visible/partial | Восприятие игрока публикой             |
| `controversyLevel`      | int | `0..100` | hidden          | Риск токсичных инфоповодов             |
| `brandValue`            | int | `0..100` | hidden          | Коммерческая привлекательность         |
| `communityPresence`     | int | `0..100` | hidden          | Полезно для future sponsor/fan systems |
| `pressHandling`         | int | `1..100` | hidden          | Реакция на давление и медиа            |

---

## 11. Career History

| Поле                  | Тип          | Диапазон                           | Видимость | Назначение                                                         |
| --------------------- | ------------ | ---------------------------------- | --------- | ------------------------------------------------------------------ |
| `careerStage`         | enum         | prospect/rotation/star/veteran/etc | derived   | Стадия карьеры                                                     |
| `yearsPro`            | int          | `0..30`                            | visible   | Стаж в профессиональном баскетболе                                 |
| `draftYear`           | int/null     | `1900+`                            | visible   | Год входа в лигу/драфта                                            |
| `draftPick`           | int/null     | `1+`                               | visible   | Позиция на драфте                                                  |
| `academyTeamId`       | string/null  | optional                           | meta      | Клуб-воспитатель                                                   |
| `careerTeamsCount`    | int          | `0+`                               | visible   | Сколько клубов сменил                                              |
| `titlesWon`           | int          | `0+`                               | visible   | Командные титулы                                                   |
| `awardsCount`         | int          | `0+`                               | visible   | Количество индивидуальных наград                                   |
| `careerNarrativeTags` | array string | bounded list                       | hidden    | Теги вроде `late bloomer`, `injury comeback`, `locker-room leader` |

---

## 12. Statistics Snapshot

### Current Season Per-Game

| Поле               | Тип     | Диапазон | Видимость | Назначение             |
| ------------------ | ------- | -------- | --------- | ---------------------- |
| `gamesPlayed`      | int     | `0+`     | visible   | Сыгранные матчи        |
| `gamesStarted`     | int     | `0+`     | visible   | Матчи в старте         |
| `minutesPerGame`   | decimal | `0+`     | visible   | Средние минуты         |
| `pointsPerGame`    | decimal | `0+`     | visible   | Очки за игру           |
| `reboundsPerGame`  | decimal | `0+`     | visible   | Подборы за игру        |
| `assistsPerGame`   | decimal | `0+`     | visible   | Передачи за игру       |
| `stealsPerGame`    | decimal | `0+`     | visible   | Перехваты за игру      |
| `blocksPerGame`    | decimal | `0+`     | visible   | Блоки за игру          |
| `turnoversPerGame` | decimal | `0+`     | visible   | Потери за игру         |
| `foulsPerGame`     | decimal | `0+`     | visible   | Фолы за игру           |
| `fgPct`            | decimal | `0..1`   | visible   | Реализация с игры      |
| `threePct`         | decimal | `0..1`   | visible   | Реализация трехочковых |
| `ftPct`            | decimal | `0..1`   | visible   | Реализация штрафных    |

### Advanced And Role Stats

| Поле               | Тип         | Диапазон                     | Видимость       | Назначение                    |
| ------------------ | ----------- | ---------------------------- | --------------- | ----------------------------- |
| `usageRate`        | decimal     | `0..1`                       | hidden/partial  | Нагрузка в атаке              |
| `assistRate`       | decimal     | `0..1`                       | hidden/partial  | Доля созданных передач        |
| `reboundRate`      | decimal     | `0..1`                       | hidden/partial  | Доля подборов                 |
| `defensiveImpact`  | int/decimal | model-defined                | hidden          | Производный показатель защиты |
| `efficiencyRating` | int/decimal | model-defined                | visible/partial | Композитная продуктивность    |
| `plusMinus`        | decimal     | open                         | visible/partial | On/off или raw plus-minus     |
| `roleType`         | enum        | creator/shooter/wing/big/etc | derived         | Операционный role tag         |

---

## 13. Attribute Groups Recommended For UI

### Показывать пользователю напрямую

- имя, возраст, национальность, позиция;
- рост, вес;
- базовые игровые атрибуты;
- `overall`;
- `potential` целиком или частично в зависимости от режима;
- здоровье и статус доступности;
- сезонную статистику;
- карьерные награды и краткую историю.

### Показывать частично или через отчеты

- скрытые growth-поля;
- психология;
- tactical IQ;
- injury risk;
- market value breakdown;
- social/media layer.

### Оставлять скрытым по умолчанию

- точный `growthRate`;
- `consistency`;
- `injuryProneness`;
- `ego`;
- `agentInfluence`;
- служебные narrative tags и внутренние модификаторы симуляции.

---

## 14. Minimal Rollout Order

Чтобы не пытаться завести весь каталог за один раз, разумно двигаться слоями:

1. `identity + anthropometry + base skills + overall + potential`
2. `health + fatigue + season stats`
3. `development hidden attributes`
4. `tactical IQ + psychology`
5. `market/reputation + social`
6. `deep career history + advanced stats`

---

## Итог

Полная player-модель должна быть не просто списком цифр, а несколькими связанными слоями:

- кто игрок как человек и спортсмен;
- что он умеет на паркете;
- как он думает и развивается;
- насколько он здоров и стабилен;
- как его воспринимают лига, рынок и аудитория;
- какую историю он уже прошёл.

Этот каталог нужен как единая опора для всех будущих player-систем и как защита от случайного добавления полей без общего смысла.
