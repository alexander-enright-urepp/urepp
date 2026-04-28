'use client'

import { useState } from 'react'
import { Bell, Check, AlertCircle, Loader2 } from 'lucide-react'

export default function NotificationSyncButton() {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const syncNotifications = async () => {
    setStatus('syncing')
    setMessage('')

    try {
      const OneSignal = (window as any).plugins?.OneSignal
      
      if (!OneSignal) {
        setStatus('error')
        setMessage('OneSignal not loaded. Try restarting the app.')
        return
      }

      // Get device state
      OneSignal.getDeviceState(async (state: any) => {
        console.log('Device state:', state)
        
        if (!state?.userId) {
          setStatus('error')
          setMessage('No player ID found. Check notification permissions.')
          return
        }

        // Sync to server
        const response = await fetch('/api/sync-player-id', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: state.userId })
        })

        if (response.ok) {
          setStatus('success')
          setMessage(`Synced: ${state.userId.substring(0, 8)}...`)
        } else {
          setStatus('error')
          setMessage('Failed to sync to server')
        }
      })
    } catch (err) {
      setStatus('error')
      setMessage('Error: ' + String(err))
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Bell className="w-4 h-4" />
        Push Notifications
      </h3>
      
      <button
        onClick={syncNotifications}
        disabled={status === 'syncing'}
        className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
          status === 'success' 
            ? 'bg-green-500 text-white' 
            : status === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-[#51b5ff] text-white hover:bg-[#3da8f5]'
        }`}
      >
        {status === 'syncing' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Syncing...</>
        ) : status === 'success' ? (
          <><Check className="w-4 h-4" /> Synced</>
        ) : status === 'error' ? (
          <><AlertCircle className="w-4 h-4" /> Retry Sync</>
        ) : (
          <><Bell className="w-4 h-4" /> Enable Notifications</>
        )}
      </button>
      
      {message && (
        <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
