import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const body = req.body
  const message = body?.message?.text
  const chatId = body?.message?.chat?.id

  console.log('📥 Получено сообщение:', body)

  if (!message || !chatId) {
    return res.status(400).json({ error: 'Missing message or chatId' })
  }

  // ✅ LangChain запрос
  try {
    console.log("📡 Запрос к агенту:", message)

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: message }),
    })

    const data = await response.json()
    console.log("🤖 Ответ от агента:", data)

    const reply = data.result ?? '⚠️ Агент не ответил или сломался.'

    // ✅ Telegram ответ
    console.log("📤 Отправка в Telegram:", chatId, reply)

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply,
      }),
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error("❌ Ошибка в webhook:", error)

    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: '⚠️ Произошла ошибка при вызове агента. Попробуйте позже.',
      }),
    })

    return res.status(500).json({ error: 'Agent call failed' })
  }
}
