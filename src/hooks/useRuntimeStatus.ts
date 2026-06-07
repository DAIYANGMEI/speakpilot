import { useEffect, useState } from 'react'
import type { RuntimeStatus } from '../types'

type HealthResponse = {
  ai?: RuntimeStatus
}

export function useRuntimeStatus() {
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/health', { signal: controller.signal })
      .then((response) => response.json() as Promise<HealthResponse>)
      .then((payload) => {
        if (payload.ai) {
          setRuntime(payload.ai)
        }
      })
      .catch(() => {
        setRuntime({
          configured: false,
          model: 'offline',
          provider: 'Local API',
          source: 'fallback',
        })
      })
      .finally(() => setIsChecking(false))

    return () => controller.abort()
  }, [])

  return { runtime, isChecking }
}
