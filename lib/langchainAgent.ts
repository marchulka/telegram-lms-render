import { ChatOpenAI } from 'langchain/chat_models/openai'
import { initializeAgentExecutorWithOptions } from 'langchain/agents'
import { Calculator } from 'langchain/tools'

export async function runAgent(query: string): Promise<string> {
  const model = new ChatOpenAI({
    modelName: 'gpt-4o',
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  const tools = [new Calculator()]

  const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: 'openai-functions',
    verbose: true,
  })

  const result = await executor.run(query)
  return result
}
 