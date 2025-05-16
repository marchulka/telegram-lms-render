import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Calculator } from 'langchain/tools';
import { AIMessage, HumanMessage } from 'langchain/schema';

export async function runAgent(query: string): Promise<string> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('❌ OPENAI_API_KEY не указан в переменных окружения.');
    }

    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      openAIApiKey: apiKey,
    });

    const tools = [new Calculator()];

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: 'openai-functions',
      verbose: true,
    });

    console.log('⚙️ Агент инициализирован. Запрос:', query);

    const result = await executor.run([
      new HumanMessage(query)
    ]);

    console.log('✅ Ответ агента:', result);

    return result;
  } catch (error: any) {
    console.error('❌ LangChain agent failed:', error);
    return '⚠️ Ошибка при выполнении запроса. Попробуйте позже.';
  }
}
