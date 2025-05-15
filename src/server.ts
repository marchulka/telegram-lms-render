import express from 'express'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

// Память бота: кто уже получал приветствие (сброс при перезапуске)
const greetedUsers = new Set<string>()

app.post('/webhook', (req, res) => {
  const message = req.body?.message
  const chat_id = message?.chat?.id
  const text = message?.text
  const is_bot = message?.from?.is_bot

  res.sendStatus(200) // немедленный ответ Telegram

  if (!chat_id || !text || is_bot) return

  const userKey = `telegram_${chat_id}`

  ;(async () => {
    try {
      // Только первый раз отправляем приветствие
      if (text === '/start' && !greetedUsers.has(userKey)) {
        greetedUsers.add(userKey)

        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text: '👋 Render Webhook на связи! Добро пожаловать в LMS Fishby.'
          })
        })
      }

      // Сохраняем попытку в Supabase
      await fetch(`${SUPABASE_URL}/rest/v1/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          user_id: userKey,
          question: 'demo',
          selected: text,
          correct: true,
          bot_id: 'default_bot',
          created_at: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('❌ Ошибка Webhook:', error)
    }
  })()
})

app.get('/', (req, res) => {
  res.send('✅ Бот работает на Render!')
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
})
