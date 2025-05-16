import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { DynamicTool } from 'langchain/tools';

export async function runAgent(query: string): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('❌ OPENAI_API_KEY не указан в переменных окружения.');
    }

    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // ⚠️ Временный мок-инструмент
    const dummyTool = new DynamicTool({
      name: "echoTool",
      description: "Возвращает то же, что и получил",
      func: async (input: string) => `Echo: ${input}`,
    });

    const executor = await initializeAgentExecutorWithOptions(
      [dummyTool],
      model,
      {
        agentType: 'openai-functions',
        verbose: true,
      }
    );

    const result = await executor.run(query);
    return result;
  } catch (error: any) {
    console.error('❌ LangChain agent failed:', error);
    return '⚠️ Ошибка при выполнении запроса. Попробуйте позже.';
  }
}
