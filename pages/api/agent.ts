import type { NextApiRequest, NextApiResponse } from 'next'
import { runAgent } from '../../lib/langchainAgent'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query } = req.body

  if (!query) {
    return res.status(400).json({ error: 'No query provided' })
  }

  try {
    const result = await runAgent(query)
    res.status(200).json({ result })
  } catch (error) {
    console.error('? Ошибка LangChain:', error)
    res.status(500).json({ error: 'LangChain agent error' })
  }
}
// 🤖 force build
