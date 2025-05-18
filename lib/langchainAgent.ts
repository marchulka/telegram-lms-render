import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { logChatToSupabase } from './logChatToSupabase';
import { Tool } from 'langchain/tools';
import { SupabaseTool } from './tools/supabaseTool';

// 🛠️ Временный кастомный инструмент — EchoTool
class EchoTool extends Tool {
  name = 'echo';
  description = 'Повторяет сообщение обратно пользователю';

  async _call(input: string): Promise<string> {
    return `🔁 Ты сказал: ${input}`;
  }

  async call(input: string): Promise<string> {
    return this._call(input);
  }
}

export async function runAgent(query: string): Promise<string> {
  try {
    console.log("🚀 Пришел запрос в агент:", query);

    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY!,
    });

    // ✅ Подключаем и EchoTool, и SupabaseTool
    const tools = [
      new EchoTool(),
      new SupabaseTool() // 🔌 Вот он — кастомный инструмент
    ];

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: 'openai-functions',
      verbose: true,
    });

    const result = await executor.run(query);
    console.log("✅ Ответ от агента:", result);

    await logChatToSupabase(query, result);

    return result;
  } catch (error: any) {
    console.error('❌ Ошибка в LangChain агенте:', error);
    return '⚠️ Ошибка при выполнении запроса. Попробуйте позже.';
  }
}
