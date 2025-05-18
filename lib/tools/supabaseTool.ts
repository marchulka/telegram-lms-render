import { Tool } from 'langchain/tools';
import { createClient } from '@supabase/supabase-js';

// --- ОДИН раз объявляем переменные (это важно!) ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

// Проверяем наличие переменных окружения (это важно для диагностики!)
if (!supabaseUrl) {
  throw new Error('❌ SUPABASE_URL не найден в .env. Обнови файл окружения!');
}
if (!supabaseServiceKey) {
  throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY или SUPABASE_SERVICE_ROLE не найден в .env. Обнови файл окружения!');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseTool extends Tool {
  name = 'supabase_tool';
  description = 'Добавляет запись в таблицу chat_logs с вопросом и ответом';

  async _call(input: string): Promise<string> {
    // input разделяется на вопрос и ответ по разделителю ||
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