'use client'

import { useState, useEffect } from 'react'

export function AnalyticsWidget({ playerId }: { playerId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics?playerId=' + playerId)
      .then(res => res.json())
      .then(data => { setData(data); setLoading(false) })
  }, [playerId])

  if (loading) return <div>Loading...</div>
  if (!data) return null

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold">Analytics</h3>
      <p>Total Views: {(data.totalViews || 0).toLocaleString()}</p>
      <p>Videos: {data.videoCount || 0}</p>
      <p>Avg Views: {(data.avgViews || 0).toLocaleString()}</p>
    </div>
  )
}