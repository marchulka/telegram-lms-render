
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

app.post('/webhook', async (req, res) => {
  const message = req.body?.message
  const chat_id = message?.chat?.id
  const text = message?.text

  if (!chat_id || !text) {
    return res.sendStatus(400)
  }

  if (text === '/start') {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: '👋 Render Webhook на связи!' })
    })
  }

  await fetch(`${SUPABASE_URL}/rest/v1/attempts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      user_id: `telegram_${chat_id}`,
      question: 'demo',
      selected: text,
      correct: true,
      bot_id: 'default_bot',
      created_at: new Date().toISOString()
    })
  })

  res.sendStatus(200)
})

app.get('/', (req, res) => {
  res.send('✅ Бот работает на Render!')
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
