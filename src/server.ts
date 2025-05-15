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

const greetedUsers = new Set<string>()

app.post('/webhook', (req, res) => {
  const message = req.body?.message
  const chat_id = message?.chat?.id
  const text = message?.text
  const is_bot = message?.from?.is_bot

  console.log('📥 Получено сообщение:', JSON.stringify(message, null, 2))

  res.sendStatus(200)

  if (!chat_id || !text || is_bot) {
    console.warn('⚠️ Пропущено сообщение: нет chat_id или text, или это бот')
    return
  }

  const userKey = `telegram_${chat_id}`

  ;(async () => {
    try {
      if (text === '/start' && !greetedUsers.has(userKey)) {
        greetedUsers.add(userKey)
        console.log('👋 Отправляем приветствие пользователю', userKey)

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text: '👋 Render Webhook на связи! Добро пожаловать в LMS Fishby.'
          })
        })
        const telegramResult = await response.json()
        console.log('📤 Ответ Telegram:', telegramResult)
      }

      // ЛОГИРОВАНИЕ переменных Supabase
      console.log('🔗 Supabase URL:', SUPABASE_URL)
      console.log('🔐 Supabase Key:', SUPABASE_ANON_KEY?.slice(0, 8) + '...')

      const payload = {
        user_id: userKey,
        question: 'demo',
        selected: text,
        correct: true,
        bot_id: 'default_bot',
        created_at: new Date().toISOString()
      }

      console.log('📡 Отправка в Supabase:', JSON.stringify(payload, null, 2))

      const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY || ''}`
        },
        body: JSON.stringify(payload)
      })

      const supabaseText = await supabaseRes.text()
      console.log('📥 Ответ от Supabase:', supabaseRes.status, supabaseText)
    } catch (error) {
      console.error('❌ Ошибка Webhook:', error)
    }
  })()
})

app.get('/', (_, res) => {
  res.send('✅ Бот работает на Render!')
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
})
