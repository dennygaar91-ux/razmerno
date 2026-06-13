# Generated Reports Policy — «Размерно»

Дата: 2026-06-13
Тип: architecture / QA documentation.

## Цель

Документ фиксирует правила для generated reports и audit artifacts.

## Правило

Generated reports не должны подменять исходную архитектурную документацию. Они являются снимками состояния репозитория на момент запуска скрипта.

## Где хранить

Разрешенная зона:

- `docs/audits/generated/`

## Что можно генерировать

- infrastructure inventory;
- dependency graph reports;
- CSS architecture reports;
- static audit reports;
- CI artifacts.

## Что нельзя считать вручную выполненным

Файл считается актуальным только если:

1. скрипт реально запускался;
2. результат записан в ожидаемую папку;
3. GitHub Actions artifact или commit подтверждает наличие результата.

## Отчетность

В отчетах нужно разделять:

- generated artifact;
- committed documentation;
- prepared local content;
- missing content.
