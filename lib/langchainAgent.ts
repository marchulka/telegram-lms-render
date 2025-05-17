import { ChatOpenAI } from '@langchain/openai'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { logChatToSupabase } from './logChatToSupabase'

export async function runAgent(query: string): Promise<string> {
  try {
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    const tools = [] // пока без инструментов, добавим позже

    const executor = await initializeAgentExecutorWithOptions(tools, model, {
      agentType: 'openai-functions',
      verbose: true,
    })

    const result = await executor.run(query)

    // 💾 Сохраняем результат в Supabase
    await logChatToSupabase(query, result)

    return result
  } catch (error: any) {
    console.error('❌ Ошибка в LangChain агенте:', error)
    return '⚠️ Ошибка при выполнении запроса. Попробуйте позже.'
  }
}
