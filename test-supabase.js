const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'https://shqpyhluwmdqjhkujgkm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNocXB5aGx1d21kcWpoa3VqZ2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzOTM5ODksImV4cCI6MjA4ODk2OTk4OX0.aXPz8_Vk1xx5bnsr14CMel261dqVYS-tV40wE1VneiQ'
)

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Success! Table exists. Row count:', data.length)
  }
}
test()
