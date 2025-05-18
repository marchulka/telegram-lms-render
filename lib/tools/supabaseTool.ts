const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

import { Tool } from 'langchain/tools';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseTool extends Tool {
  name = 'supabase_tool';
  description = 'Добавляет запись в таблицу chat_logs с вопросом и ответом';

  // ✅ Реализация обязательного метода _call
  async _call(input: string): Promise<string> {
    const [question, answer] = input.split('||');

    const { error } = await supabase.from('chat_logs').insert({
      question: question?.trim() ?? '',
      answer: answer?.trim() ?? '',
    });

    if (error) {
      console.error('❌ Ошибка SupabaseTool:', error);
      return '❌ Ошибка при сохранении в Supabase';
    }

    return '✅ Сохранено в Supabase';
  }
}
