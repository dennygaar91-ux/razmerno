# Windows / PowerShell deploy commands

## 0. Перейти в папку проекта

```powershell
cd "C:\Users\denny_gaef0ib\Desktop\Размерно\rzm_v2"
```

Путь может отличаться — укажи папку, где лежит `package.json`.

## 1. Установить зависимости

```powershell
npm install
```

## 2. Проверить проект перед deploy

```powershell
npm run predeploy:guard
npm run qa:stage5
npm run qa:stage4
npm run qa:all
npm run build
npm audit --audit-level=moderate
```

## 3. Применить Supabase SQL

В Supabase SQL Editor выполнить:

```text
supabase/deploy/deploy-all.sql
```

## 4. Задать env в Vercel

В Vercel Dashboard → Project → Settings → Environment Variables задать переменные из:

```text
.env.production.example
```

Минимально обязательные:

```text
ADMIN_API_KEY
ALLOWED_ORIGINS
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
ORDER_MANAGER_EMAIL
MAIL_FROM
VITE_ORDER_API_URL
VITE_USE_MOCK_API
ADMIN_PASSWORD_HASH
VITE_YANDEX_METRIKA_ID
```

## 5. Git commit / push

```powershell
git status
git add .
git commit -m "Prepare production deploy"
git push origin main
```

## 6. Post-deploy smoke

После завершения deploy в Vercel:

```powershell
$env:SMOKE_BASE_URL="https://razmerno.ru"
$env:ADMIN_API_KEY="<ADMIN_API_KEY из Vercel>"
npm run smoke:deploy
```

## 7. Ручная проверка

Открыть:

```text
https://razmerno.ru/api/health
https://razmerno.ru/
https://razmerno.ru/configurator
https://razmerno.ru/admin
https://razmerno.ru/robots.txt
https://razmerno.ru/sitemap.xml
```

## 8. Если что-то сломалось

```powershell
git log --oneline -5
git revert <hash_последнего_коммита>
git push origin main
```

После rollback можно оставить Supabase migrations — они additive.
