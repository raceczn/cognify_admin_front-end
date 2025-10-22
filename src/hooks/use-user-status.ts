import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'

type UserStatus = 'online' | 'offline' | 'busy'

const HEARTBEAT_INTERVAL = 30_000 // 30 seconds

export const useUserStatus = () => {
  const heartbeatRef = useRef<number | null>(null)
  const { user } = useAuthStore((state) => state.auth)

  const updateStatus = async (uid: string | undefined, status: UserStatus) => {
    if (!uid) return
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/status/set`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, status }),
      })

      if (!res.ok) {
        console.error('Error updating status:', res.status, await res.text())
      }
    } catch (e) {
      console.error('Error updating status:', e)
    }
  }

  const sendHeartbeat = async (uid: string | undefined) => {
    if (!uid) return
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/status/heartbeat`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      })

      if (!res.ok) {
        console.error('Heartbeat failed:', res.status, await res.text())
      }
    } catch (e) {
      console.error('Heartbeat failed:', e)
    }
  }

  const setStatus = (status: 'online' | 'busy') => {
    updateStatus(user?.uid, status as UserStatus)
  }

  // Start heartbeat on mount and when user changes
  useEffect(() => {
    if (!user?.uid) return

    // Set initial online status
    updateStatus(user.uid, 'online')

    // Start heartbeat
    const startHeartbeat = () => {
      sendHeartbeat(user.uid)
      heartbeatRef.current = window.setInterval(() => {
        sendHeartbeat(user.uid)
      }, HEARTBEAT_INTERVAL)
    }

    startHeartbeat()

    // Cleanup
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
      // Try to set offline status on unmount
      updateStatus(user.uid, 'offline')
    }
  }, [user?.uid])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!user?.uid) return

      if (document.hidden) {
        // User switched away from the tab/window
        setStatus('busy')
      } else {
        // User is back on the tab/window
        setStatus('online')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user?.uid])

  // Handle before unload to set offline status
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!user?.uid) return

      // Best-effort: use navigator.sendBeacon if available
      try {
        if (navigator && typeof navigator.sendBeacon === 'function') {
          const url = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/status/set`
          const payload = JSON.stringify({ uid: user.uid, status: 'offline' })
          navigator.sendBeacon(
            url,
            new Blob([payload], { type: 'application/json' })
          )
        }
      } catch (e) {
        // ignore - best effort only
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user?.uid])

  return {
    setStatus,
  }
}
