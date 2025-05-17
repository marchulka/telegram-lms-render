import { supabase } from './supabaseClient'

export async function logChatToSupabase(user_input: string, agent_response: string) {
  const { data, error } = await supabase
    .from('chat_logs')
    .insert([
      { user_input, agent_response },
    ])

  if (error) {
    console.error('❌ Ошибка записи лога в Supabase:', error)
  } else {
    console.log('✅ Лог записан в Supabase:', data)
  }
} 