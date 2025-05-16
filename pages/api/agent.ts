import type { NextApiRequest, NextApiResponse } from 'next';
import { runAgent } from '@/lib/langchainAgent'; // ✅ абсолютный импорт (работает с tsconfig-paths)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'No valid query provided' });
  }

  try {
    const answer = await runAgent(query);
    res.status(200).json({ answer }); // ✅ более очевидное поле
  } catch (error) {
    console.error('❌ Ошибка LangChain:', error);
    res.status(500).json({ error: 'LangChain agent error' });
  }
}
