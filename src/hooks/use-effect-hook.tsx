import { useEffect, useRef } from "react"
import { useAuthStore } from "@/stores/auth-store"
import type { AuthState } from "@/stores/auth-store"

/**
 * Reusable hook that triggers whenever the auth-store changes.
 * The callback receives the strongly typed auth object.
 */
export function useAuthEffect(
  callback: (auth: AuthState["auth"]) => void,
  options: { runOnMount?: boolean } = { runOnMount: false }
) {
  const auth = useAuthStore((state) => state.auth)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true
      if (!options.runOnMount) return
    }

    callback(auth)
  }, [auth.user, auth.accessToken])
}
