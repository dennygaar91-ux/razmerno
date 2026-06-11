# Admin password hash

## Что изменилось

Production env больше не должен хранить plaintext admin password.

Используется:

```env
ADMIN_PASSWORD_HASH=<sha256 hex>
```

## Как сгенерировать hash в PowerShell

```powershell
$Password = Read-Host "Admin password"
$Bytes = [System.Text.Encoding]::UTF8.GetBytes($Password)
$Hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($Bytes)
($Hash | ForEach-Object { $_.ToString("x2") }) -join ""
```

Скопировать результат в Vercel env:

```env
ADMIN_PASSWORD_HASH=<result>
```

## Важно

- Не хранить сам пароль в `.env`.
- Пароль должен быть длинным и уникальным.
- `ADMIN_API_KEY` и admin password — разные секреты.
