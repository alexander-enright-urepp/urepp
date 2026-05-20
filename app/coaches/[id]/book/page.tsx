import { createClient } from '@supabase/supabase-js';
import BookCoachClient from '@/components/coaching/BookCoachClient';

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Generate static params for all coach IDs
export async function generateStaticParams() {
  if (!supabaseUrl || !supabaseKey) {
    return [];
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: coaches } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'coach');
  
  return coaches?.map((coach) => ({
    id: coach.id,
  })) || [];
}

export default function BookCoachPage({ params }: { params: { id: string } }) {
  return <BookCoachClient coachId={params.id} />;
}
