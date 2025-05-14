
# Telegram LMS Bot (Render-ready)

## 🚀 Быстрый старт

1. Создай Render Web Service
2. Используй этот репозиторий
3. В переменных окружения установи:

- TELEGRAM_TOKEN
- SUPABASE_URL
- SUPABASE_ANON_KEY

4. После деплоя выполни:

```bash
curl -F "url=https://your-render-domain.onrender.com/webhook" \
     https://api.telegram.org/bot<ТВОЙ_ТОКЕН>/setWebhook
```

✅ Бот готов к работе!
