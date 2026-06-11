# Yandex Metrika

## Env

```env
VITE_YANDEX_METRIKA_ID=<counter id>
```

`VITE_YM_ID` временно поддерживается как legacy fallback.

## Что отслеживается

- page_view;
- hero_cta_click;
- furniture_type_selected;
- constructor_step_next/back;
- material_selected;
- filling_changed;
- price_viewed;
- order_form_opened;
- order_submit_success/error;
- validation_error_seen.

## Важно

Скрипт Метрики загружается только если задан `VITE_YANDEX_METRIKA_ID`.
