
# Telegram LMS Bot (Render-ready, fixed)

## 🚀 Быстрый старт

1. Залей проект на GitHub
2. Создай Render Web Service
3. Укажи:
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

4. Переменные окружения:
- TELEGRAM_TOKEN
- SUPABASE_URL
- SUPABASE_ANON_KEY

5. Установи webhook в Telegram:

```bash
curl -F "url=https://your-render-domain.onrender.com/webhook" \
     https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/setWebhook
```

✅ Бот готов!
