import type { NextApiRequest, NextApiResponse } from 'next'
import { Telegraf } from 'telegraf'

const bot = new Telegraf(process.env.TELEGRAM_TOKEN!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body
    const message = body?.message?.text
    const chatId = body?.message?.chat?.id

    console.log('📥 Получено сообщение:', body)

    if (!message || !chatId) {
      return res.status(400).json({ error: 'No message or chatId' })
    }

    // 🔗 Вызов LangChain агента
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message }),
    })

    const data = await response.json()

    // 🔁 Ответ пользователю
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: data.result ?? '⚠️ Ошибка: агент не ответил',
      }),
    })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('❌ Ошибка webhook:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
