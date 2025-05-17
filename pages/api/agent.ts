import type { NextApiRequest, NextApiResponse } from 'next';
import { runAgent } from '../../lib/langchainAgent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.warn('🚫 Метод запроса не поддерживается:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  if (!query) {
    console.warn('❌ Пустой запрос. Нет поля "query"');
    return res.status(400).json({ error: 'No query provided' });
  }

  console.log('🚀 Пришел запрос в агент:', query);

  try {
    const result = await runAgent(query);

    console.log('✅ Ответ от агента:', result);

    // Указываем правильную кодировку и тип
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ answer: result });
  } catch (error) {
    console.error('❌ Ошибка LangChain в агенте:', error);

    res.status(500).json({
      answer: '⚠️ Ошибка при выполнении запроса. Попробуйте позже.',
    });
  }
}
