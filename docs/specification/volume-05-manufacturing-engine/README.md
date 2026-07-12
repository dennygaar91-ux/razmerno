# RPES — Том V. Manufacturing Engine

Проект: «Размерно»  
Версия: 1.1 draft  
Статус: рабочий Source of Truth по производственной модели  
Дата: 2026-06-25  

---

# 1. Назначение тома

Том V описывает внутренний производственный движок «Размерно»: Production JSON, правила валидации, производственные сущности, Basis boundary, версии, snapshots, review-логику и будущую технологическую автоматизацию.

Этот том не описывает клиентский UX. Его задача — зафиксировать, как пользовательская конфигурация должна превращаться в производственно корректную модель, пригодную для расчёта, проверки, хранения, админского просмотра и дальнейшей ручной подготовки в БАЗИС-Мебельщик.

---

# 2. Главный принцип

Production Engine является внутренним источником истины для производственной корректности изделия.

Конструктор может быть простым, Three.js может быть красивым, Pricing может показывать компактную цену, но все эти слои должны опираться на одну производственно валидную модель.

Главный инвариант:

> Если конфигурация не может быть выражена как валидная производственная модель, она не может быть отправлена как заявка.

---

# 3. Роль Production JSON

Production JSON — внутренний технический формат, который описывает изделие на уровне, достаточном для дальнейшей производственной подготовки.

Production JSON должен содержать:

- изделие;
- тип мебели;
- размеры;
- секции;
- панели;
- материалы;
- кромку;
- фасады;
- наполнение;
- фурнитуру;
- опоры;
- пазы;
- присадку;
- validation;
- review;
- Basis manual plan;
- версии;
- snapshots.

Клиент не должен видеть внутренний Production JSON.

---

# 4. Production v3 и Production v4

## 4.1 Production v3

Production v3 — текущий рабочий runtime export.

Он уже имеет:

- production export;
- panels;
- hardware;
- drilling;
- edge banding;
- Basis manual-json-ready;
- tests/golden snapshots.

## 4.2 Production v4

Production v4 — новый внутренний инженерный слой, который должен стать основой до MVP.

Он развивается изолированно до полной готовности к runtime migration.

Уже реализованные/запланированные слои v4:

- Foundation;
- Adapter v3 → v4;
- Material Policy;
- Assembly Policy;
- Panel Projection;
- Hardware Policy;
- Edge/Groove Policy;
- Facade Policy;
- Support Policy.

## 4.3 Принцип миграции

Нельзя резко заменять v3 на v4 без полного QA.

Миграция должна идти этапами:

1. v4 как isolated model.
2. v3 → v4 adapter.
3. v4 validation.
4. golden comparison.
5. dual-run.
6. runtime switch.
7. old v3 deprecation.

---

# 5. Производственные сущности

## 5.1 Изделие

Изделие содержит:

- тип мебели;
- итоговые габариты;
- высоту с учётом опор;
- конфигурацию секций;
- выбранные материалы;
- выбранную фурнитуру;
- статус validation;
- version/snapshot.

## 5.2 Секция

Секция — базовый строительный блок модели.

Ограничения секции:

- ширина 200–900 мм;
- высота 200–2000 мм;
- глубина 150–900 мм.

Секции могут развиваться:

- влево;
- вправо;
- вверх.

## 5.3 Панель

Панель — производственная единица.

Панель должна иметь:

- id;
- role;
- material;
- thickness;
- width/height/depth;
- texture direction;
- edge banding policy;
- relation to assembly;
- documentation inclusion flag.

## 5.4 Материал

Материал должен быть связан с role панели.

Правила:

- корпус: ЛДСП 16;
- фасад: ЛДСП 16 или МДФ 18;
- ХДФ: 3 мм;
- drawer-bottom: ХДФ 3.

## 5.5 Фурнитура

Фурнитура должна быть связана с семантической ролью, а не только с произвольной строкой.

MVP-бренды:

- Hettich;
- Firmax.

Пользователь выбирает производителя, но не конкретную модель.

## 5.6 Кромка

Кромка:

- корпус / полки / ящик: 1 мм по кругу;
- фасады / drawer-front: 2 мм по кругу;
- ХДФ: без кромки.

## 5.7 Пазы

Пазы пока являются placeholder-слоем.

Они не считаются финально утверждённой механической обработкой до отдельного технологического решения.

Актуальные placeholder-пути:

- паз под заднюю стенку;
- паз под дно ящика.

## 5.8 Присадка

Присадка является обязательной частью будущего производственного JSON, но её координатный стандарт пока не финализирован.

До финализации:

- операции требуют technologist check;
- нельзя считать drilling final;
- нельзя генерировать автоматический Basis/.b3d на основе непроверенных координат.

---

# 6. Validation

## 6.1 Назначение

Validation отвечает за то, может ли конфигурация стать заявкой.

Пользовательские ошибки должны блокироваться до отправки заявки.

## 6.2 Что валидируется

- тип мебели;
- размеры;
- секции;
- панели;
- материалы;
- фасады;
- зазоры;
- опоры;
- фурнитура;
- наполнение;
- кромка;
- пазы;
- pricing readiness;
- production JSON readiness;
- Basis manual readiness.

## 6.3 Ошибки

Ошибки должны блокировать заявку.

Примеры:

- секция меньше минимального размера;
- фасад с неправильной толщиной;
- материал не подходит для роли панели;
- элемент не помещается;
- price не рассчитан;
- production model не сформирована.

## 6.4 Warnings

Warnings могут использоваться внутри системы, но пользователь не должен видеть технологические warnings.

Клиенту показывается только простое объяснение, если требуется действие.

---

# 7. Review

## 7.1 Назначение

Review — внутренний слой проверки production model.

Он нужен для админки, технолога и дальнейшей подготовки в производство.

## 7.2 Видимость

Review не виден клиенту в техническом виде.

Клиент может видеть только клиентскую версию summary.

## 7.3 Review statuses

Рабочие статусы:

- ready;
- needs-review;
- blocked;
- manual-json-ready;
- requires-technologist-check.

---

# 8. Basis Boundary

## 8.1 Release v1 boundary

Release v1:

- **не генерирует** `.b3d` автоматически;
- **обязательно сохраняет** structured configuration JSON для каждого submitted order;
- создаёт B3D **вручную** в Basis после submit;
- передаёт в production primarily готовый B3D file;
- хранит visual preview/screenshot reference при submit.

JSON / Basis manual plan остаётся обязательным входом для ручной сборки B3D технологом.

JSON alone не является factory-ready handoff.

## 8.1.1 Source of truth after handoff

Backend остаётся source of truth после production handoff. Basis — production tool/editor, не система учёта заказа.

## 8.2 Запрещённые claims

Нельзя утверждать:

- система автоматически создаёт `.b3d`;
- Basis model готов без участия технолога;
- JSON является полноценной заменой Basis-файла.

## 8.3 Корректная формулировка

Корректная формулировка:

> Structured configuration JSON сохраняется как configuration source и backend-owned snapshot input. Final production handoff artifact в Release v1 — **B3D file**, подготовленный технологом вручную в БАЗИС-Мебельщик. JSON alone не является factory-ready handoff.

Backend остаётся Source of Truth для configuration/price snapshots. B3D — factory-facing artifact.

Decision source: Release v1 product decisions; `accepted-backlog-decisions-v1.md` §8 Production / Manufacturing.

## 8.4 Future

Автоматизация `.b3d` возможна только после:

- финализации SKU;
- финализации drilling coordinates;
- финализации пазов;
- финализации Basis mapping;
- технологической проверки.

---

# 9. Snapshots и версии

## 9.1 Зачем нужны snapshots

Каждая заявка должна быть воспроизводимой.

Для этого сохраняются:

- user configuration snapshot;
- price snapshot;
- production model snapshot;
- revision history.

## 9.2 Где используются

Snapshots нужны:

- в личном кабинете;
- в админке;
- для повторной проверки;
- для сравнения версий;
- для производства;
- для аудита цены.

## 9.3 Версии в личном кабинете

Клиент может видеть версию заказа/проекта, но не внутренний технический JSON.

---

# 10. Production JSON v4 policy layers

## 10.1 Foundation

Фиксирует типы, обязательные поля и базовые invariants.

## 10.2 Material Policy

Фиксирует:

- ЛДСП 16;
- МДФ 18;
- ХДФ 3;
- direction by longest side;
- HDF no direction.

## 10.3 Assembly Policy

Фиксирует:

- боковины на дне;
- верх шкафа между боковинами;
- верх тумбы/комода сверху;
- height includes support;
- shelf inset 30;
- facade gaps 1.5/3.

## 10.4 Panel Projection

Фиксирует:

- role classification;
- panel semantics;
- world box;
- local axes;
- documentation inclusion.

## 10.5 Hardware Policy

Фиксирует:

- hinge baseline;
- concealed slide baseline;
- reinforced shelf support;
- push-to-open;
- SKU not-final.

## 10.6 Edge/Groove Policy

Фиксирует:

- body edge 1 mm;
- facade edge 2 mm;
- HDF no edge;
- groove placeholders.

## 10.7 Facade Policy

Фиксирует:

- single facade;
- paired facade;
- drawer-front as facade;
- opening modes;
- gaps.

## 10.8 Support Policy

Фиксирует:

- no-support;
- adjustable-leg-60;
- adjustable-leg-100;
- metal-spiked support;
- support count matrix;
- support placement.

---

# 11. Открытые производственные слои

## 11.1 Drawer Engineering

Нужно определить:

- точные размеры ящика;
- боковины;
- задник;
- дно;
- SKW = LW - 42;
- LT = NL + 5;
- полезный объём;
- совместимость с направляющими.

## 11.2 Hinge Engineering

Нужно определить:

- количество петель;
- отступы;
- чашка Ø35;
- глубина;
- overlay / half-overlay / inset;
- compatibility by facade thickness.

## 11.3 Slide Engineering

Нужно определить:

- длины направляющих;
- посадочные размеры;
- совместимость глубины;
- push-to-open / soft-close variants.

## 11.4 Drilling Coordinate Standard

Нужно определить:

- panel-local coordinate system;
- world-to-local transform;
- min edge distance;
- collision;
- template semantics;
- Basis interpretation.

## 11.5 SKU Mapping

Нужно определить SKU для:

- материалов;
- петель;
- направляющих;
- полкодержателей;
- опор;
- ручек;
- push-to-open.

---

# 12. Связь с Pricing

Production model должна быть связана с Pricing.

Цена должна считаться из той же модели, которая формирует production JSON.

Иначе появится риск:

- клиент видит одну цену;
- производство считает другую;
- админка видит третью.

Это запрещено.

---

# 13. Связь с Admin

Админка должна видеть:

- заявку;
- production summary;
- validation status;
- review status;
- Basis status;
- warnings/errors, если они внутренние;
- JSON/PDF export после реализации.

Админка может видеть технические детали, клиент — нет.

---

# 14. Связь с Customer Cabinet

Личный кабинет показывает клиентскую версию production summary:

- тип мебели;
- размеры;
- материалы;
- наполнение;
- цена;
- статус;
- номер заявки;
- история.

Нельзя показывать:

- присадку;
- кромку;
- пазы;
- raw JSON;
- Basis technical plan.

---

# 15. Инварианты Manufacturing Engine

1. Production model — внутренний source of truth.
2. Клиент не видит raw production JSON.
3. Production v4 должен быть внедрён до MVP.
4. `.b3d` не генерируется в MVP.
5. Manual JSON / Basis manual plan — текущий MVP boundary.
6. Ошибочная production model не может стать заявкой.
7. Цена и Production JSON должны опираться на одну модель.
8. Каждая заявка должна быть воспроизводимой.
9. Каждый production snapshot должен быть версионируемым.
10. SKU и drilling нельзя считать финальными без отдельного технологического решения.

---

# 16. Backlog implications

1. Production v4 Runtime Migration.
2. Dual-run v3/v4 validation.
3. Drawer Engineering Layer.
4. Hinge Engineering Layer.
5. Slide Engineering Layer.
6. Drilling Coordinate Standard.
7. SKU Mapping Layer.
8. Basis Manufacturing Layer.
9. Production Snapshot Versioning.
10. Customer-visible Production Summary.
11. Admin Production Review v2.
12. JSON/PDF Export.

# 17. Решения v1.1 по runtime, координатам и материалам

## 17.1 Production v4 заменяет v3

Целевое решение: Production v4 должен полностью заменить Production v3.

v3 остаётся только временным переходным runtime до controlled migration.

После успешной миграции:

- v4 становится единственным production runtime;
- v3 удаляется или переводится в архив;
- долгосрочная поддержка v3 + v4 одновременно не планируется.

## 17.2 Почему не поддерживать v3 и v4 параллельно

Постоянная поддержка двух production engine создаёт риски:

- расхождение логики;
- двойные тесты;
- разные production snapshots;
- разные правила Pricing;
- разные Basis plan;
- усложнение поддержки.

Поэтому dual-run допустим только как временный migration stage.

## 17.3 Snapshot strategy

Во время миграции можно временно хранить v3 и v4 snapshots для сравнения.

После перехода на v4 основным snapshot становится v4.

Исторические v3 snapshots могут храниться только для старых заказов, созданных до миграции.

## 17.4 Материал должен существовать в Supabase

Production model не должна использовать материал, отсутствующий в Supabase catalog.

Принцип:

> материал в конструкторе = материал в Supabase = материал в Production JSON.

Если материал недоступен в Supabase, он не должен быть доступен для новой конфигурации.

## 17.5 Отсутствующий материал

Если материал пропал из Supabase:

- новые проекты с этим материалом создавать нельзя;
- существующие проекты должны открываться с сохранённым snapshot;
- в админку должна приходить проблема/ошибка каталога;
- система не должна молча считать новую заявку по устаревшей цене.

## 17.6 Координатное правило

Для Production JSON координаты начинаются с левого нижнего дальнего угла.

Это должно быть отражено в будущей спецификации координат:

- panel coordinates;
- section coordinates;
- drilling coordinates;
- Basis mapping.

## 17.7 Технический долг: координаты и Basis

Нужно отдельно проработать:

- точное определение осей X/Y/Z;
- panel-local coordinates;
- world coordinates;
- преобразование для Basis;
- координаты присадки;
- правила проверки отверстий.
