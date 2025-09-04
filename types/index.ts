// Support signal types
export type SupportType = 'support' | 'supersupport' | 'oppose'
export type SupportVisibility = 'public' | 'private' | 'anonymous'

// User state types
export type UserState = 'none' | 'skipped' | 'dismissed' | 'starred'

// Channel member roles
export type ChannelRole = 'owner' | 'moderator' | 'member'

// Proposal visibility and moderation
export type ProposalVisibility = 'channel' | 'public'
export type ModerationMode = 'auto' | 'manual'

// Proposal status (computed at runtime)
export type ProposalStatus = 'draft' | 'published' | 'threshold_met' | 'reified' | 'expired'

// Feed filter types
export type FeedFilter = 'all' | 'supported' | 'active' | 'expired' | 'starred'

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types for proposal creation
export interface CreateProposalInput {
  title: string
  note: string
  channelId: string
  minCapacity?: number
  maxCapacity?: number
  threshold?: number
  publishAt?: Date
  expiresAt?: Date
  visibility: ProposalVisibility
  allowAnonymous: boolean
  moderationMode: ModerationMode
  externalChatUrl?: string
  imageUrl?: string
}

// Form types for channel creation
export interface CreateChannelInput {
  name: string
  description?: string
}

// Form types for support signals
export interface SupportSignalInput {
  type: SupportType
  visibility: SupportVisibility
}

// Calendar export types
export interface CalendarEvent {
  title: string
  description?: string
  location?: string
  startAt: Date
  endAt?: Date
  uid: string
} 