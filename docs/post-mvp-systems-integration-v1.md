# Post-MVP Systems Integration v1

## Цель документа

Этот документ связывает между собой post-MVP модули карьеры:

- `player domain`
- `training`
- `player development`
- `scouting`
- `draft`
- `finance`
- `transfers`
- `social / reputation`
- `auth / cloud saves`

Его задача:

- зафиксировать корректное взаимодействие модулей;
- определить источники истины по данным;
- развести ответственность между системами;
- описать порядок расчетов в течение сезона и межсезонья;
- не допустить конфликтов, двойного пересчета и circular logic.

---

## Статус

Текущий статус документа: `draft`.

Приоритет: `P2`  
Эпик: `Post-MVP Backlog`  
Компонент: `Cross-System Integration`  
Релиз: `Post-MVP`  
Спринт: `Future`

Важно:

- это интеграционный target state;
- документ не требует реализовать все системы сразу;
- rollout должен идти слоями, но по общей схеме, описанной ниже.

---

## Главный принцип

Все post-MVP модули должны взаимодействовать не напрямую друг с другом,
а через устойчивые доменные сущности и понятные этапы season loop.

Базовая идея:

```text
матчевые данные ->
сезонные агрегаты ->
управленческие решения ->
межсезонные изменения ->
новый сезон
```

Это означает:

- матч не должен напрямую менять трансферную цену игрока в обход агрегатов;
- тренировка не должна напрямую переписывать финансы;
- скаутинг не должен менять hidden attributes игрока;
- финансы не должны сами считать игровой `overall`;
- development не должен работать в случайный момент посреди активного раунда.

---

## Список модулей и их роль

### 1. Player Domain

Это корневой слой игрока.

Он хранит:

- identity;
- текущие игровые атрибуты;
- hidden attributes;
- физический профиль;
- историю;
- сезонную статистику;
- social profile.

Он не принимает продуктовые решения сам по себе, а служит общей базой для других модулей.

### 2. Training

Training отвечает за управляемое давление на рост и усталость.

Он влияет на:

- `fatigue`
- `development modifiers`
- в будущем `injury risk`

Training не является источником истины для итогового post-season growth outcome.

### 3. Player Development

Development отвечает за post-season изменение атрибутов игрока.

Он использует:

- age curve;
- potential headroom;
- season role;
- training effect;
- random factor.

Именно development меняет игровые атрибуты и затем инициирует пересчет `overall`.

### 4. Scouting

Scouting отвечает за уровень знания о внешних игроках и проспектах.

Он влияет на:

- то, что видно пользователю;
- точность отчетов;
- качество решений перед драфтом и трансферами.

Scouting не меняет реальный hidden profile игрока. Он меняет только `visibility layer`.

### 5. Draft

Draft отвечает за ежегодный вход молодых игроков в лигу.

Он использует:

- rookie generation;
- scouting knowledge;
- потребности команды;
- roster constraints;
- финансовую доступность подписания.

Draft завершает процесс попаданием проспекта в `Player` + связанные профили и в новый roster.

### 6. Finance

Finance отвечает за экономические рамки клуба.

Он влияет на:

- возможность подписания и удержания игроков;
- payroll pressure;
- ограничения состава;
- доступность отдельных трансферов.

Finance не должен напрямую менять игровые атрибуты.

### 7. Transfers

Transfers отвечают за движение готовых игроков между клубами.

Они используют:

- player value;
- team need;
- finance constraints;
- roster constraints;
- открытость transfer window.

Transfers меняют `teamId`, историю карьеры и финансовые обязательства.

### 8. Social / Reputation

Этот слой отвечает за медийность, public image, star power и восприятие игрока.

Он влияет на:

- часть UI и narrative;
- в будущем marketability;
- в будущем косвенные финансовые бонусы;
- в будущем ожидания болельщиков и клуба.

Он не должен напрямую менять матчевой `overall`.

### 9. Auth / Cloud Saves

Этот слой отвечает только за ownership и storage карьеры.

Он не должен менять доменные правила:

- не влияет на симуляцию;
- не влияет на progression;
- не влияет на финансы;
- не влияет на трансферы.

Его задача: безопасно хранить и возвращать одно и то же доменное состояние.

---

## Источники истины

Ниже зафиксировано, какой модуль считается владельцем конкретного типа данных.

| Данные                   | Источник истины          | Кто может читать                   | Кто может менять           |
| ------------------------ | ------------------------ | ---------------------------------- | -------------------------- |
| Identity игрока          | `Player`                 | все модули                         | backend domain services    |
| Текущие игровые атрибуты | `PlayerAttributeSet`     | simulation, UI, development        | development, admin tools   |
| `overall`                | derived из attribute set | simulation, UI, transfers          | только recalculation logic |
| Hidden growth traits     | `PlayerHiddenAttributes` | development, scouting layer        | backend domain services    |
| Fatigue                  | training / season state  | simulation, UI                     | training + recovery flow   |
| Season stats             | `PlayerSeasonStat`       | UI, development, finance, scouting | season/stat aggregation    |
| Scout knowledge          | scouting module          | UI, draft, transfer UI             | scouting services          |
| Budget / payroll         | finance module           | UI, transfers, roster checks       | finance services           |
| Transfer state           | transfer module          | UI, roster logic                   | transfer services          |
| Prospect pool            | draft module             | scouting, draft UI                 | draft services             |
| Save ownership           | auth/cloud saves         | frontend, backend                  | auth/save services         |

Ключевое правило:

```text
derived data не редактируется вручную там,
где у нее уже есть выделенный источник расчета
```

Примеры:

- `overall` не редактируется в finance;
- `player value` не хранится как произвольное число в transfer UI;
- scouting report не меняет actual potential игрока;
- standings не редактируются модулем finances.

---

## Правильный порядок расчетов

Чтобы модули не спорили между собой, расчеты должны идти в фиксированном порядке.

## Внутри сезона

### Weekly / round loop

Рекомендуемая последовательность:

1. пользователь задает training focus и нагрузку;
2. training обновляет `fatigue` и training modifiers;
3. матч/раунд симулируется на основе текущих атрибутов и текущей готовности;
4. сохраняются match results;
5. агрегируются season stats;
6. при необходимости обновляются finance micro-effects и social signals;
7. save snapshot сохраняется.

Важно:

- training не должен сразу permanently повышать `overall` каждую неделю;
- основной рост игрока происходит через season-end development;
- fatigue может влиять на матч раньше, чем long-term progression.

## В конце сезона

Рекомендуемая последовательность:

1. сезон завершается;
2. фиксируются итоговые standings и season stats;
3. начисляются season finance outcomes;
4. выполняется post-season player development;
5. пересчитываются `overall` и team strength proxies;
6. открывается transfer / contract phase;
7. проходит draft;
8. финализируются roster moves;
9. стартует новый сезон.

Ключевое правило:

```text
development раньше transfers,
draft раньше final roster lock,
finances раньше разрешения сделок
```

Почему именно так:

- клуб должен входить в трансферное окно уже с обновленной силой игроков;
- драфт должен учитывать актуальные needs после сезона;
- финансы должны ограничивать решения до того, как пользователь начнет подписывать игроков.

---

## Канонический межсезонный pipeline

Ниже зафиксирован безопасный pipeline для первой полноценной post-MVP карьеры.

### Phase 1. Season Finalization

- закрыть матчи;
- финализировать standings;
- закрыть сезонные награды и титул;
- зафиксировать final season stats.

### Phase 2. Finance Settlement

- посчитать season income;
- посчитать season expenses;
- обновить club budget baseline;
- проверить payroll carry-over.

### Phase 3. Player Development

- взять age curve;
- взять hidden potential traits;
- взять season role / minutes;
- применить training effect;
- применить bounded random factor;
- изменить атрибуты;
- пересчитать `overall`.

### Phase 4. Contract / Transfer Preparation

- обновить player value;
- обновить team need;
- пересчитать roster gaps;
- определить, какие сделки доступны финансово и по составу.

### Phase 5. Scouting Refresh

- сгенерировать новый rookie pool;
- создать новые scouting targets;
- обновить уровень знания по уже отслеживаемым игрокам.

### Phase 6. Draft

- определить порядок выбора;
- провести picks;
- создать rookie players и связанные профили;
- привязать их к командам;
- добавить rookie contracts / salary commitments.

### Phase 7. Transfer Window

- разрешить сделки;
- валидировать budgets;
- валидировать roster limits;
- обновить `teamId`, history, payroll, transfer logs.

### Phase 8. New Season Bootstrap

- пересчитать team-level projections;
- зафиксировать стартовые roster state;
- открыть новый сезон;
- сохранить новый save snapshot.

---

## Влияния между модулями

Ниже важные зависимости в явном виде.

## Training -> Development

Training влияет на development только как modifier.

Он не должен:

- сам менять hidden potential;
- сам менять age curve;
- сам гарантировать рост.

Формула на уровне идеи:

```text
development outcome =
  age
  + potential headroom
  + season usage
  + training modifier
  + bounded randomness
```

## Development -> Simulation

Development меняет attributes только в межсезонье.

Simulation в активном сезоне всегда использует:

- текущий `PlayerAttributeSet`
- текущую `fatigue/readiness`

## Scouting -> Draft

Scouting не создает игроков драфта.

Draft создает игроков.
Scouting только определяет:

- насколько хорошо команда понимает этих игроков;
- какие ranges и reports видит пользователь.

## Finance -> Transfers

Finance определяет доступность сделки.

Transfers не должны обходить:

- budget cap;
- payroll rule;
- roster constraints.

## Transfers -> Team Strength

После любой сделки должны обновляться:

- roster membership;
- team rating proxy;
- player history;
- payroll state.

Но не должны автоматически запускаться:

- season development;
- scouting recalculation;
- случайная смена hidden traits.

## Reputation / Social -> Finance

В `v1` этот эффект должен быть слабым и агрегированным.

Хорошая связь:

- высокий star power слегка повышает club attractiveness или marketability.

Плохая связь:

- social profile напрямую меняет матчевую силу игрока.

---

## Анти-конфликты

Чтобы система не начала ломаться от собственной сложности, нужно заранее закрепить запреты.

### Запрет 1. Один модуль не должен одновременно и считать, и интерпретировать чужой derived output

Пример:

- transfer module не считает `overall`;
- finance module не считает `player development`;
- scouting UI не считает actual potential.

### Запрет 2. Hidden data не должна утекать через convenience shortcuts

Если `potential` скрытый, нельзя:

- показывать его в API другого модуля случайно;
- использовать его в UI без scouting layer;
- отдавать его во frontend вместе с roster просто “для удобства”.

### Запрет 3. Один и тот же эффект не должен применяться дважды

Пример рисков:

- training увеличил growth pressure;
- development еще раз отдельно усилил того же игрока тем же коэффициентом;
- в итоге мы случайно удвоили эффект.

Решение:

- training хранит modifier;
- development один раз читает modifier и применяет его.

### Запрет 4. Historical data не должно быть перезаписано current state

Пример:

- `PlayerSeasonStat` хранит сезон 2028;
- новый season bootstrap не должен переписать эту запись текущими числами.

### Запрет 5. Save layer не должен менять доменную семантику

Auth/cloud saves не должны создавать отдельную логику:

- “онлайн overall”
- “локальный overall”
- “облачная версия standings”

Есть одна доменная модель, просто с разными способами владения и хранения.

---

## Минимальный порядок внедрения

Чтобы интеграция была реалистичной, модули нужно вводить не одновременно, а в правильной очередности.

### Wave 1

- `player domain split`
- `player development`
- `training`

Почему:

- это создает базовую живую карьеру;
- эти модули тесно связаны и дают пользу даже без рынка игроков.

### Wave 2

- `draft`
- `scouting`

Почему:

- после появления development уже есть смысл в молодых игроках;
- scouting появляется как информационный слой поверх draft.

### Wave 3

- `finance`
- `transfers`

Почему:

- рынок игроков становится устойчивым, только когда уже есть бюджеты и roster pressure;
- иначе трансферы будут слишком аркадными и слабо объяснимыми.

### Wave 4

- `social / reputation`
- `auth / cloud saves`

Почему:

- они полезны, но не являются ядром спортивной логики;
- их легче безопасно встраивать после стабилизации core systems.

---

## Что должно быть общим техническим контрактом

Для корректной интеграции между модулями стоит заранее держать в `shared`:

- enum позиций;
- enum статусов сезона и матча;
- диапазоны игровых атрибутов;
- shape базового `Player`;
- shape `PlayerAttributeSet`;
- shape `PlayerHiddenAttributes`;
- shape `PlayerSeasonStat`;
- shape `ScoutReport`;
- shape `DraftProspect`;
- shape `TransferSummary`;
- shape `FinanceSnapshot`.

Это позволит:

- не дублировать доменную лексику;
- держать frontend и backend синхронными;
- безопаснее раскладывать rollout по частям.

---

## Итоговая схема

```text
Player Domain
  -> используется simulation, training, development, scouting, transfers

Training
  -> меняет fatigue и development modifiers

Season / Match Loop
  -> создает stats and outcomes

Player Development
  -> меняет attributes after season

Scouting
  -> меняет visibility, не actual player truth

Draft
  -> добавляет new players into domain

Finance
  -> ограничивает roster and market actions

Transfers
  -> меняют team ownership and payroll

Auth / Cloud Saves
  -> сохраняют whole state without changing game rules
```

---

## Короткий вывод

Корректная интеграция этих модулей строится на четырех правилах:

1. у каждого типа данных есть один владелец;
2. derived values считаются в одном месте;
3. сезон и межсезонье имеют фиксированный порядок фаз;
4. информационные системы не подменяют реальные игровые данные.

Если держаться этой схемы, post-MVP система будет расти как единая карьера,
а не как набор конфликтующих фич.
