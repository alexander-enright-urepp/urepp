const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ovsfnjfznznfqkgtpuyy.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92c2ZuamZ6bnpuZnFrZ3RwdXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MzA4NTEsImV4cCI6MjA4OTAwNjg1MX0.llDYzRjKksUeQhZ6w0JFnadi3wGQ22vvdz9tb2aKu1M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('Checking database schema...\n')
  
  // Try to get a sample record to see what columns exist
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Error:', error.message)
    if (error.message.includes('does not exist')) {
      console.log('\n❌ The profiles table does not exist!')
      console.log('Please run the SQL in scripts/setup-database.sql in your Supabase SQL Editor.')
    }
    return
  }
  
  console.log('✅ profiles table exists')
  
  if (data && data.length > 0) {
    console.log('\nCurrent columns in profiles table:')
    const columns = Object.keys(data[0])
    columns.forEach(col => {
      console.log(`  - ${col}`)
    })
    
    // Check for required columns
    const requiredColumns = [
      'username', 'first_name', 'last_name', 'city', 'state', 
      'high_school', 'teams_played_for', 'primary_position', 'secondary_position',
      'bats', 'throws', 'grad_year', 'height', 'weight',
      'exit_velocity', 'pitch_velocity', 'sixty_time', 'gpa',
      'instagram', 'twitter', 'youtube', 'bio', 'profile_picture_url'
    ]
    
    const missingColumns = requiredColumns.filter(c => !columns.includes(c))
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Missing columns:')
      missingColumns.forEach(col => console.log(`  - ${col}`))
      console.log('\n⚠️  The database schema needs to be updated.')
      console.log('Please run the SQL in scripts/setup-database.sql in your Supabase SQL Editor.')
    } else {
      console.log('\n✅ All required columns exist!')
    }
  } else {
    console.log('Table exists but is empty. Cannot determine schema from data.')
    console.log('Attempting to insert a test record to check schema...')
    
    // Try to insert a minimal record to see what error we get
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ test: 'value' }])
    
    if (insertError) {
      console.log('\nInsert error (this shows available columns):')
      console.log(insertError.message)
    }
  }
  
  // Check storage bucket
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets()
  if (bucketError) {
    console.log('\n❌ Could not check storage buckets:', bucketError.message)
  } else {
    const profileBucket = buckets.find(b => b.name === 'profile-pictures')
    if (profileBucket) {
      console.log('\n✅ profile-pictures storage bucket exists')
    } else {
      console.log('\n❌ profile-pictures storage bucket is missing!')
    }
  }
}

checkDatabase()