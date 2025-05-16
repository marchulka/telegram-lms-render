import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

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

    const executor = await initializeAgentExecutorWithOptions([], model, {
      agentType: 'zero-shot-react-description', // 👈 это ключевое!
      verbose: true,
    });

    const result = await executor.run(query);
    return result;
  } catch (error: any) {
    console.error('❌ LangChain agent failed:', error);
    return '⚠️ Ошибка при выполнении запроса. Попробуйте позже.';
  }
}
