# Formula TeamStrength v1

## Цель документа

Этот документ фиксирует первую воспроизводимую формулу `teamStrength`
для MVP Basketball Manager.

Она нужна для того, чтобы:

- прозрачно оценивать силу состава;
- использовать один и тот же подход внутри simulation engine;
- сделать влияние сильной и слабой команды статистически заметным;
- при этом сохранить контролируемый элемент случайности.

---

## Базовый принцип

`TeamStrength v1` считается как смесь:

- `average overall` игроков;
- `position weights` по стартовым ролям;
- базовых характеристик состава;
- `stamina factor`;
- небольшого `random factor`.

Идея формулы:

- сильный и сбалансированный состав чаще выигрывает;
- команда с перекосами по ролям проседает;
- высокий stamina/athleticism помогает на дистанции матча;
- случайность влияет на отдельный матч, но не ломает долгосрочную иерархию силы.

---

## Компоненты формулы

### 1. Average overall

Берется средний `overall` по всем игрокам snapshot-команды.

Если состав пустой, используется fallback `60`.

### 2. Position weights

Для ролей стартовой пятерки используется отдельный weighted impact:

- `PG`: `0.19`
- `SG`: `0.19`
- `SF`: `0.20`
- `PF`: `0.20`
- `C`: `0.22`

Для каждой позиции берется лучший доступный игрок этой роли.
Если позиция отсутствует, команда получает штраф через fallback:

```text
positionScore = averageOverall * 0.9
```

### 3. Player role score

Лучший игрок на позиции оценивается не только по `overall`,
а по role-specific набору атрибутов:

- `shooting`
- `passing`
- `defense`
- `rebounding`
- `stamina`

В MVP действует то же временное правило, что и в `overall v1`:

```text
stamina = athleticism
```

### 4. Base roster attributes

Отдельно считается средняя сила состава по базовым атрибутам:

```text
attributeStrength =
  shooting * 0.26 +
  passing * 0.18 +
  defense * 0.24 +
  rebounding * 0.16 +
  athleticism * 0.16
```

### 5. Stamina factor

`Stamina factor` учитывает:

- среднюю stamina по всему roster;
- stamina глубины состава, особенно top-8 игроков.

Формула:

```text
staminaFactor =
  averageStamina * 0.65 +
  top8AverageStamina * 0.35
```

### 6. Random factor

Для отдельного матча используется ограниченный random swing:

```text
randomFactor = (randomValue - 0.5) * 5
```

То есть влияние случайности ограничено диапазоном:

```text
-2.5 .. +2.5
```

Этого достаточно, чтобы апсет был возможен,
но недостаточно, чтобы случайность постоянно перекрывала разницу в классе.

---

## Итоговая формула

```text
teamStrength =
  team.rating * 0.24 +
  averageOverall * 0.34 +
  positionStrength * 0.22 +
  attributeStrength * 0.12 +
  staminaFactor * 0.08 +
  randomFactor
```

После расчета результат:

- округляется до `2` знаков после запятой;
- ограничивается диапазоном `1..100`.

---

## Ожидаемое поведение

`TeamStrength v1` должен давать следующие свойства:

- более сильная команда статистически выигрывает чаще;
- позиционно сбалансированная команда сильнее перекошенного состава при близком `overall`;
- более высокий stamina/athleticism улучшает силу состава;
- случайность заметна на уровне одного матча;
- случайность не доминирует на серии матчей.

---

## Где реализовано

Код формулы находится в:

- [packages/simulation-engine/src/team-strength-v1.mjs](/home/newuser/Documents/BM/packages/simulation-engine/src/team-strength-v1.mjs:1)

Интеграция в матчевую симуляцию находится в:

- [packages/simulation-engine/src/simulate-match.mjs](/home/newuser/Documents/BM/packages/simulation-engine/src/simulate-match.mjs:244)

Тесты находятся в:

- [packages/simulation-engine/test/team-strength-v1.test.mjs](/home/newuser/Documents/BM/packages/simulation-engine/test/team-strength-v1.test.mjs:1)

---

## Итог

`TeamStrength v1` — это первая практичная формула силы команды для MVP.

Она:

- учитывает `average overall`;
- учитывает `position weights`;
- учитывает `stamina factor`;
- учитывает `random factor`;
- дает статистическое преимущество сильной команде;
- уже встроена в simulation engine и покрыта тестами.
