import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'

type UserStatus = 'online' | 'offline' | 'busy'

// Heartbeat and status reporting are disabled to avoid backend 404s
// and unnecessary network chatter. This hook now safely no-ops.

export const useUserStatus = () => {
  const heartbeatRef = useRef<number | null>(null)
  const { user } = useAuthStore((state) => state.auth)

  const setStatus = (_status: 'online' | 'busy') => {
    // No-op
  }

  // Start heartbeat on mount and when user changes
  useEffect(() => {
    // Ensure any previous intervals are cleared when user changes.
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
        heartbeatRef.current = null
      }
    }
  }, [user?.uid])

  // Handle page visibility changes
  // Visibility handling is disabled since status updates are no-ops

  // Handle before unload to set offline status
  // Beforeunload handler disabled since we no longer report offline status

  return {
    setStatus,
  }
}
