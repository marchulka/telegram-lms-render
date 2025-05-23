import type { NextApiRequest, NextApiResponse } from 'next'
import pdfParse from 'pdf-parse'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const body = req.body
  const textMessage = body?.message?.text
  const chatId = body?.message?.chat?.id
  const document = body?.message?.document

  console.log('📥 Получено сообщение:', body)

  const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN
  const BASE_URL = process.env.BASE_URL

  if (!TELEGRAM_TOKEN) {
    console.error("❌ TELEGRAM_TOKEN не задан в переменных окружения")
    return res.status(500).json({ error: 'Missing Telegram token' })
  }
  if (!BASE_URL) {
    console.error("❌ BASE_URL не задан в переменных окружения")
    return res.status(500).json({ error: 'Missing BASE_URL' })
  }

  // --- Если пришёл PDF-документ ---
  if (document && chatId) {
    try {
      const fileId = document.file_id
      const fileResp = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`
      )
      const fileData = await fileResp.json()
      const filePath = fileData?.result?.file_path
      if (!filePath) throw new Error('file_path не получен из Telegram')

      const pdfResp = await fetch(
        `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`
      )
      const arrayBuffer = await pdfResp.arrayBuffer()
      const pdfBuffer = Buffer.from(arrayBuffer)

      const pdfTextResult = await pdfParse(pdfBuffer)
      const pdfText = pdfTextResult.text || ''
      console.log('📄 Извлечено символов из PDF:', pdfText.length)

      const shortText = pdfText.slice(0, 3900)

      const response = await fetch(`${BASE_URL}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: shortText }),
      })

      const data = await response.json()
      const reply = data?.answer ?? '⚠️ Агент не ответил.'

      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: reply }),
        }
      )

      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error("❌ Ошибка обработки PDF:", err)
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '⚠️ Не удалось обработать PDF.',
          }),
        }
      )
      return res.status(500).json({ error: 'PDF processing failed' })
    }
  }

  // --- Если пришло обычное текстовое сообщение ---
  if (textMessage && chatId) {
    try {
      const response = await fetch(`${BASE_URL}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: textMessage }),
      })

      const data = await response.json()
      const reply = data?.answer ?? '⚠️ Агент не ответил.'

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
        }),
      })

      return res.status(200).json({ ok: true })
    } catch (err) {
      console.error("❌ Ошибка в webhook:", err)

      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '⚠️ Ошибка при обращении к агенту. Попробуйте позже.',
        }),
      })

      return res.status(500).json({ error: 'Agent call failed' })
    }
  }

  // --- Если не смогли определить тип сообщения ---
  console.log('❌ Нет текста, chatId или документа PDF')
  return res.status(200).json({ error: 'Missing message/chatId/document' })
}