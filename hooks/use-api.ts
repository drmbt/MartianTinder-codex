import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  headers?: Record<string, string>
  credentials?: RequestCredentials
  onSuccess?: (data: unknown) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
}

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/**
 * Generic API hook for consistent fetch handling
 */
export function useApi<T = unknown>(url: string) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (options: ApiOptions = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        credentials: options.credentials || 'include',
        body: options.body ? JSON.stringify(options.body) : undefined,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || `HTTP ${response.status}`)
      }

      setState({ data: result.data || result, loading: false, error: null })
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      options.onSuccess?.(result.data || result)
      
      return result.data || result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      setState({ data: null, loading: false, error: errorMessage })
      
      if (options.errorMessage) {
        toast.error(options.errorMessage)
      } else {
        toast.error(errorMessage)
      }
      
      options.onError?.(errorMessage)
      throw error
    }
  }, [url])

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null }),
  }
}

/**
 * Optimistic update hook for immediate UI feedback
 */
export function useOptimisticApi<T = unknown>(
  url: string,
  optimisticUpdate: (current: T, action: unknown) => T
) {
  const [optimisticData, setOptimisticData] = useState<T | null>(null)
  const api = useApi<T>(url)

  const executeOptimistic = useCallback(async (options: ApiOptions & { optimisticAction?: unknown } = {}) => {
    // Apply optimistic update immediately
    if (optimisticData && options.optimisticAction) {
      setOptimisticData(optimisticUpdate(optimisticData, options.optimisticAction))
    }

    try {
      const result = await api.execute(options)
      setOptimisticData(result) // Update with real data
      return result
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticData(api.data)
      throw error
    }
  }, [api, optimisticData, optimisticUpdate])

  return {
    ...api,
    data: optimisticData || api.data,
    execute: executeOptimistic,
    setInitialData: setOptimisticData,
  }
}