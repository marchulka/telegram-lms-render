// lib/tools/supabaseTool.ts

import { Tool } from 'langchain/tools';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class SupabaseTool extends Tool {
  name = 'supabase_tool';
  description = 'Позволяет добавлять записи в таблицу logs с вопросом и ответом';

  async call(input: string): Promise<string> {
    const [question, answer] = input.split('|||');

    if (!question || !answer) {
      return '⚠️ Неверный формат. Используй: вопрос|||ответ';
    }

    const { error } = await supabase.from('chat_logs').insert([
      {
        question: question.trim(),
        answer: answer.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      return `Ошибка при записи в Supabase: ${error.message}`;
    }

    return '✅ Вопрос и ответ сохранены в базе Supabase.';
  }
}
