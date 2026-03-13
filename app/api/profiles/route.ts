import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Generate slug from name + grad year
    const baseSlug = `${body.firstName.toLowerCase()}-${body.lastName.toLowerCase()}-${body.gradYear}`
    const slug = baseSlug.replace(/\s+/g, '-')
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        {
          first_name: body.firstName,
          last_name: body.lastName,
          email: body.email,
          phone: body.phone,
          grad_year: parseInt(body.gradYear),
          position: body.position,
          height: body.height,
          weight: body.weight,
          throws: body.throws,
          bats: body.bats,
          high_school: body.highSchool,
          hometown: body.hometown,
          state: body.state,
          gpa: body.gpa,
          sat_score: body.satScore,
          act_score: body.actScore,
          bio: body.bio,
          slug: slug,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data, slug })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}
