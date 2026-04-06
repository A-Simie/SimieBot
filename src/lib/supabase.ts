import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChatThread {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const getChatThreads = async (userId: string) => {
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching threads:', error);
    return [];
  }

  return data as ChatThread[];
};

export const upsertChatThread = async (thread: Partial<ChatThread>) => {
  const { data, error } = await supabase
    .from('threads')
    .upsert(thread)
    .select()
    .single();

  if (error) {
    console.error('Error upserting thread:', error);
    return null;
  }

  return data as ChatThread;
};

export const deleteChatThread = async (threadId: string) => {
  const { error } = await supabase
    .from('threads')
    .delete()
    .eq('id', threadId);

  if (error) {
    console.error('Error deleting thread:', error);
    return false;
  }

  return true;
};
