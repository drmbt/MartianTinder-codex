import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useApi } from './use-api'

interface CreateChannelData {
  name: string
  description?: string
}

interface JoinChannelData {
  inviteCode: string
}

/**
 * Hook for channel-related API operations
 */
export function useChannel() {
  const router = useRouter()
  const createApi = useApi('/api/channels')
  const joinApi = useApi('/api/channels/join')

  const createChannel = useCallback(async (data: CreateChannelData) => {
    return createApi.execute({
      method: 'POST',
      body: data,
      successMessage: 'Channel created successfully!',
      onSuccess: (result) => {
        router.push(`/c/${result.id}`)
      },
    })
  }, [createApi, router])

  const joinChannel = useCallback(async (data: JoinChannelData) => {
    return joinApi.execute({
      method: 'POST',
      body: data,
      successMessage: 'Successfully joined channel!',
      onSuccess: (result) => {
        router.push(`/c/${result.channelId}`)
      },
    })
  }, [joinApi, router])

  return {
    createChannel,
    joinChannel,
    loading: createApi.loading || joinApi.loading,
    error: createApi.error || joinApi.error,
  }
}

/**
 * Hook for fetching channel feed
 */
export function useChannelFeed(channelId?: string, filters?: any) {
  const url = channelId 
    ? `/api/feed?channelId=${channelId}`
    : '/api/feed'
    
  const feedApi = useApi(url)

  const fetchFeed = useCallback(async () => {
    return feedApi.execute({
      method: 'GET',
      errorMessage: 'Failed to load feed',
    })
  }, [feedApi])

  return {
    proposals: feedApi.data?.proposals || [],
    fetchFeed,
    loading: feedApi.loading,
    error: feedApi.error,
  }
}