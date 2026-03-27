'use client'

import { useState, useEffect } from 'react'

export function StatsWidget({ title, metric }: { title: string; metric: string }) {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/stats?metric=' + metric)
      .then(res => res.json())
      .then(setData)
  }, [metric])

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-400 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-white">
        {(data?.total || 0).toLocaleString()}
      </div>
      {data?.growth !== undefined && (
        <span className={'text-sm ' + (data.growth >= 0 ? 'text-green-400' : 'text-red-400')}>
          {(data.growth >= 0 ? '+' : '') + data.growth}%
        </span>
      )}
    </div>
  )
}