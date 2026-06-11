# Order form security

## Проверки

Форма заявки и `/api/orders` защищены несколькими слоями:

1. **Origin whitelist**
   - production origin: `https://razmerno.ru`
   - dev origins: `localhost`
   - чужой origin получает `403`

2. **Honeypot**
   - скрытое поле `company`
   - если бот его заполнил, заявка фильтруется

3. **Rate-limit**
   - Upstash Redis при наличии env
   - memory fallback для local/dev

4. **Server price recalculation**
   - клиентская цена не считается доверенной
   - сервер пересчитывает price и перезаписывает payload

5. **Layout validation**
   - сервер проверяет секции/отсеки/штангу/минимальные размеры

6. **Client-side anti-spam**
   - повторная отправка не чаще одного раза в 30 секунд

## Автопроверка

```bash
npm run check:order-security
```

Эта проверка не заменяет pentest, но защищает от случайного удаления базовых production safeguards.
