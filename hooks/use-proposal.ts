import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApi, useOptimisticApi } from './use-api'
import { SupportType, SupportVisibility } from '@/types'

interface ProposalSignalOptions {
  type: SupportType
  visibility?: SupportVisibility
}

interface ProposalStateOptions {
  state: 'skipped' | 'dismissed' | 'starred' | 'none'
}

/**
 * Hook for proposal-related API operations
 */
export function useProposal(proposalId?: string) {
  const router = useRouter()
  const signalApi = useApi(`/api/proposals/${proposalId}/signal`)
  const stateApi = useApi(`/api/proposals/${proposalId}/state`)
  const reifyApi = useApi(`/api/proposals/${proposalId}/reify`)

  const submitSignal = useCallback(async (options: ProposalSignalOptions) => {
    return signalApi.execute({
      method: 'POST',
      body: {
        type: options.type,
        visibility: options.visibility || 'public',
      },
      successMessage: `${options.type} signal submitted`,
    })
  }, [signalApi])

  const removeSignal = useCallback(async () => {
    return signalApi.execute({
      method: 'DELETE',
      successMessage: 'Signal removed',
    })
  }, [signalApi])

  const updateState = useCallback(async (options: ProposalStateOptions) => {
    const result = await stateApi.execute({
      method: 'POST',
      body: { state: options.state },
    })

    // Navigate away if dismissed
    if (options.state === 'dismissed') {
      router.back()
    }

    return result
  }, [stateApi, router])

  const reifyToEvent = useCallback(async () => {
    return reifyApi.execute({
      method: 'POST',
      successMessage: 'Proposal converted to event!',
      onSuccess: (data) => {
        if (data.eventId) {
          router.push(`/events/${data.eventId}`)
        }
      },
    })
  }, [reifyApi, router])

  return {
    submitSignal,
    removeSignal,
    updateState,
    reifyToEvent,
    loading: signalApi.loading || stateApi.loading || reifyApi.loading,
    error: signalApi.error || stateApi.error || reifyApi.error,
  }
}

/**
 * Hook for creating/updating proposals
 */
export function useProposalForm() {
  const router = useRouter()
  const createApi = useApi('/api/proposals')
  
  const createProposal = useCallback(async (data: any) => {
    return createApi.execute({
      method: 'POST',
      body: data,
      successMessage: 'Proposal created successfully!',
      onSuccess: (result) => {
        router.push(`/p/${result.id}`)
      },
    })
  }, [createApi, router])

  const updateProposal = useCallback(async (id: string, data: any) => {
    const updateApi = useApi(`/api/proposals/${id}`)
    return updateApi.execute({
      method: 'PATCH',
      body: data,
      successMessage: 'Proposal updated successfully!',
      onSuccess: () => {
        router.push(`/p/${id}`)
      },
    })
  }, [router])

  return {
    createProposal,
    updateProposal,
    loading: createApi.loading,
    error: createApi.error,
  }
}

/**
 * Hook for optimistic support updates
 */
export function useOptimisticSupport(proposalId: string, initialStats: any) {
  const optimisticApi = useOptimisticApi(
    `/api/proposals/${proposalId}/signal`,
    (current, action) => {
      const newStats = { ...current }
      
      // Remove old signal if exists
      if (action.oldType) {
        if (action.oldType === 'support') newStats.supports = Math.max(0, newStats.supports - 1)
        else if (action.oldType === 'supersupport') newStats.supersupports = Math.max(0, newStats.supersupports - 1)
        else if (action.oldType === 'oppose') newStats.opposes = Math.max(0, newStats.opposes - 1)
      }
      
      // Add new signal
      if (action.type === 'support') newStats.supports++
      else if (action.type === 'supersupport') newStats.supersupports++
      else if (action.type === 'oppose') newStats.opposes++
      
      return newStats
    }
  )

  // Set initial data
  optimisticApi.setInitialData(initialStats)

  const submitSignal = useCallback(async (type: SupportType, visibility: SupportVisibility = 'public', currentSignal?: any) => {
    return optimisticApi.execute({
      method: 'POST',
      body: { type, visibility },
      optimisticAction: { type, oldType: currentSignal?.type },
      successMessage: 'Support signal submitted!',
      onSuccess: () => {
        // Refresh to get latest data
        window.location.reload()
      },
    })
  }, [optimisticApi])

  return {
    stats: optimisticApi.data || initialStats,
    submitSignal,
    loading: optimisticApi.loading,
    error: optimisticApi.error,
  }
}