import { Tool } from 'langchain/tools';

export class EchoTool extends Tool {
  name = 'echo';
  description = 'Повторяет сообщение обратно пользователю';

  async _call(input: string): Promise<string> {
    return `🔁 Ты сказал: ${input}`;
  }

  async call(input: string): Promise<string> {
    return this._call(input);
  }
} 