import { supabase } from './supabase'

// Track analytics events
export async function trackAnalytics({
  profileUserId,
  eventType,
  viewerId = null,
  viewerType = 'guest',
  referrer = null,
  clickedItem = null,
}: {
  profileUserId: string
  eventType: string
  viewerId?: string | null
  viewerType?: 'recruiter' | 'athlete' | 'guest'
  referrer?: string | null
  clickedItem?: string | null
}) {
  try {
    // Get device info
    const device = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    
    // Get referrer or use document.referrer
    const pageReferrer = referrer || document.referrer || 'direct'
    
    console.log('📊 Tracking analytics:', {
      profileUserId,
      eventType,
      viewerType,
      clickedItem,
      device,
      referrer: pageReferrer,
      timestamp: new Date().toISOString()
    })
    
    const { error } = await supabase.from('profile_analytics').insert({
      profile_user_id: profileUserId,
      viewer_id: viewerId,
      viewer_type: viewerType,
      event_type: eventType,
      referrer: pageReferrer,
      device,
      clicked_item: clickedItem,
    })
    
    if (error) {
      console.error('❌ Analytics insert error:', error)
    } else {
      console.log('✅ Analytics saved successfully')
    }
  } catch (error) {
    console.error('Analytics tracking error:', error)
  }
}

// Get analytics summary for a profile
export async function getAnalyticsSummary(profileUserId: string, days: number = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  console.log('Fetching analytics for profile_user_id:', profileUserId, 'since:', since.toISOString())

  // Get all events in timeframe
  const { data: events, error } = await supabase
    .from('profile_analytics')
    .select('*')
    .eq('profile_user_id', profileUserId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })

  console.log('Analytics query result:', events?.length || 0, 'events, Error:', error)

  if (error) {
    console.error('Error fetching analytics:', error)
    return null
  }

  if (!events || events.length === 0) {
    console.log('No analytics events found')
    return null
  }

  // Calculate stats
  const profileViews = events.filter(e => e.event_type === 'profile_view').length
  const uniqueViewers = new Set(events.filter(e => e.event_type === 'profile_view').map(e => e.viewer_id)).size
  const recruiterViews = events.filter(e => e.event_type === 'profile_view' && e.viewer_type === 'recruiter').length
  const linkClicks = events.filter(e => ['social_click', 'share_click', 'resume_click'].includes(e.event_type)).length
  const resumeClicks = events.filter(e => e.event_type === 'resume_click').length
  const mediaViews = events.filter(e => e.event_type === 'media_click').length
  const socialClicks = events.filter(e => e.event_type === 'social_click').length
  const statsViews = events.filter(e => e.event_type === 'stats_view').length

  // Views by day (last 7 days)
  const viewsByDay: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    viewsByDay[d.toISOString().split('T')[0]] = 0
  }
  events
    .filter(e => e.event_type === 'profile_view')
    .forEach(e => {
      const date = e.created_at.split('T')[0]
      if (viewsByDay[date] !== undefined) {
        viewsByDay[date]++
      }
    })

  // Top clicked items
  const clickedItems: Record<string, number> = {}
  events
    .filter(e => e.clicked_item)
    .forEach(e => {
      clickedItems[e.clicked_item!] = (clickedItems[e.clicked_item!] || 0) + 1
    })

  // Traffic sources
  const trafficSources: Record<string, number> = {}
  events.forEach(e => {
    const source = e.referrer?.includes('facebook') ? 'social' : 
                   e.referrer?.includes('twitter') ? 'social' : 
                   e.referrer?.includes('instagram') ? 'social' : 
                   e.referrer === 'direct' || !e.referrer ? 'direct' : 
                   e.referrer?.includes('recruiter') ? 'recruiter_search' : 'shared_link'
    trafficSources[source] = (trafficSources[source] || 0) + 1
  })

  // Device breakdown
  const devices: Record<string, number> = {}
  events.forEach(e => {
    devices[e.device || 'desktop'] = (devices[e.device || 'desktop'] || 0) + 1
  })

  // Recent activity (last 10)
  const recentActivity = events.slice(0, 10).map(e => ({
    type: e.event_type,
    viewerType: e.viewer_type,
    clickedItem: e.clicked_item,
    timestamp: e.created_at,
  }))

  return {
    profileViews,
    uniqueViewers,
    recruiterViews,
    linkClicks,
    resumeClicks,
    mediaViews,
    socialClicks,
    statsViews,
    viewsByDay,
    clickedItems: Object.entries(clickedItems).sort((a, b) => b[1] - a[1]).slice(0, 5),
    trafficSources: Object.entries(trafficSources),
    devices: Object.entries(devices),
    recentActivity,
  }
}

// Helper to get viewer type based on auth status
export function getViewerType(isAuthenticated: boolean, role?: string): 'recruiter' | 'athlete' | 'guest' {
  if (!isAuthenticated) return 'guest'
  if (role === 'recruiter') return 'recruiter'
  return 'athlete'
}