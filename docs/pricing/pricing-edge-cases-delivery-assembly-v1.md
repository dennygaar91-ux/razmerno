# Pricing Edge Cases / Delivery & Assembly Matrix v1

Дата: 2026-06-16
Роль: 03 Pricing Agent
Статус: completed in PR / pending CI and merge evidence

## 1. Executive Summary

Этот документ фиксирует pricing contract и test coverage вокруг доставки, сборки, warning/error states и client/server parity для текущего pricing layer проекта «Размерно».

Главный инвариант: цена остаётся точной, deterministic и integer-based в рублях. Стоимость мебели, доставки и сборки считаются отдельными компонентами, а checkout total равен сумме этих компонентов.
