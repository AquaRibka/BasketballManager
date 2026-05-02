# Formula Overall v1

## Цель документа

Этот документ фиксирует первую воспроизводимую формулу `overall` для игрока в MVP Basketball Manager.
Она нужна для того, чтобы:

- одинаково считать общий рейтинг в backend и simulation engine;
- не подбирать `overall` вручную для каждого игрока;
- иметь прозрачную и тестируемую основу для дальнейшего баланса.

---

## Базовый принцип

`Overall v1` считается как взвешенная сумма ключевых игровых атрибутов игрока.

В формуле участвуют:

- `shooting`
- `passing`
- `defense`
- `rebounding`
- `stamina`
- `position`

### Важное временное правило MVP

В текущей Prisma-модели игрока уже существует поле `athleticism`, а отдельного поля `stamina` пока нет.

Поэтому в `overall v1` до появления отдельного `stamina` действует временное соглашение:

```text
stamina = athleticism
```

То есть simulation engine уже считает `overall` по слоту `stamina`,
но на текущем этапе backend может подставлять в него значение `athleticism`.

---

## Диапазон результата

Итоговый `overall`:

- целое число
- в диапазоне `1..100`

После расчёта значение округляется до ближайшего целого.

---

## Веса по позициям

### `PG`

- `shooting`: `0.30`
- `passing`: `0.30`
- `defense`: `0.15`
- `rebounding`: `0.05`
- `stamina`: `0.20`

### `SG`

- `shooting`: `0.32`
- `passing`: `0.22`
- `defense`: `0.16`
- `rebounding`: `0.08`
- `stamina`: `0.22`

### `SF`

- `shooting`: `0.24`
- `passing`: `0.18`
- `defense`: `0.22`
- `rebounding`: `0.14`
- `stamina`: `0.22`

### `PF`

- `shooting`: `0.16`
- `passing`: `0.12`
- `defense`: `0.28`
- `rebounding`: `0.24`
- `stamina`: `0.20`

### `C`

- `shooting`: `0.10`
- `passing`: `0.10`
- `defense`: `0.30`
- `rebounding`: `0.30`
- `stamina`: `0.20`

---

## Формула

Общий вид:

```text
overall =
  shooting * shootingWeight +
  passing * passingWeight +
  defense * defenseWeight +
  rebounding * reboundingWeight +
  stamina * staminaWeight
```

Дальше:

1. результат округляется `Math.round`
2. итог ограничивается диапазоном `1..100`

---

## Пример

Игрок:

- `position = PG`
- `shooting = 80`
- `passing = 90`
- `defense = 74`
- `rebounding = 52`
- `stamina = 84`

Расчёт:

```text
80 * 0.30 +
90 * 0.30 +
74 * 0.15 +
52 * 0.05 +
84 * 0.20
= 24 + 27 + 11.1 + 2.6 + 16.8
= 81.5
```

После округления:

```text
overall = 82
```

---

## Правила валидации

Для `overall v1` входные атрибуты должны быть:

- числами;
- в диапазоне `0..100`;
- `position` должна быть одной из:
  - `PG`
  - `SG`
  - `SF`
  - `PF`
  - `C`

Если вход некорректен, функция расчёта должна выбрасывать ошибку.

---

## Где реализовано

Код формулы находится в:

- [packages/simulation-engine/src/overall-v1.mjs](/home/newuser/Documents/BM/packages/simulation-engine/src/overall-v1.mjs:1)

Тесты находятся в:

- [packages/simulation-engine/test/overall-v1.test.mjs](/home/newuser/Documents/BM/packages/simulation-engine/test/overall-v1.test.mjs:1)

Общие константы находятся в:

- [packages/shared/src/constants.mjs](/home/newuser/Documents/BM/packages/shared/src/constants.mjs:1)

---

## Итог

`Overall v1` — это простая, прозрачная и воспроизводимая формула для MVP.

Она:

- зависит от позиции;
- зависит от ключевых атрибутов игрока;
- даёт итог в диапазоне `1..100`;
- покрыта тестами;
- готова к использованию в simulation engine и последующей интеграции в backend.
