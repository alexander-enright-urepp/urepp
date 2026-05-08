import { createClient } from '@supabase/supabase-js';
import BookNativeClient from '@/components/coaching/BookNativeClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

export default function BookNativePage({ params }: { params: { id: string } }) {
  return <BookNativeClient coachId={params.id} />;
}
