import { z } from 'zod'

// User schemas
export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
})

// Channel schemas
export const createChannelSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const joinChannelSchema = z.object({
  inviteCode: z.string().min(1),
})

// Proposal schemas
export const createProposalSchema = z.object({
  title: z.string().min(1).max(200),
  note: z.string().max(2000),
  channelId: z.string().cuid(),
  minCapacity: z.number().min(1).optional(),
  maxCapacity: z.number().min(1).optional(),
  threshold: z.number().min(0).optional(),
  publishAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  visibility: z.enum(['channel', 'public']),
  allowAnonymous: z.boolean().default(false),
  moderationMode: z.enum(['auto', 'manual']),
  externalChatUrl: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL or empty" }
  ),
  imageUrl: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL or empty" }
  ),
  suggestedEventDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.maxCapacity && data.minCapacity) {
      return data.maxCapacity >= data.minCapacity
    }
    return true
  },
  { message: "Max capacity must be greater than or equal to min capacity" }
).refine(
  (data) => {
    if (data.expiresAt && data.publishAt) {
      return data.expiresAt > data.publishAt
    }
    return true
  },
  { message: "Expiration date must be after publish date" }
)

export const updateProposalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  note: z.string().max(2000).optional(),
  minCapacity: z.number().min(1).optional(),
  maxCapacity: z.number().min(1).optional(),
  threshold: z.number().min(0).optional(),
  publishAt: z.union([z.string().datetime(), z.date(), z.literal("")]).optional(),
  expiresAt: z.union([z.string().datetime(), z.date(), z.literal("")]).optional(),
  visibility: z.enum(['channel', 'public']).optional(),
  allowAnonymous: z.boolean().optional(),
  moderationMode: z.enum(['auto', 'manual']).optional(),
  externalChatUrl: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL or empty" }
  ),
  imageUrl: z.string().optional().refine(
    (val) => !val || val === "" || z.string().url().safeParse(val).success,
    { message: "Must be a valid URL or empty" }
  ),
  suggestedEventDate: z.string().optional(),
})

// Support signal schemas
export const supportSignalSchema = z.object({
  type: z.enum(['support', 'supersupport', 'oppose']),
  visibility: z.enum(['public', 'private', 'anonymous']),
})

// User state schemas
export const proposalUserStateSchema = z.object({
  state: z.enum(['none', 'skipped', 'dismissed', 'starred']),
})

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  startAt: z.date(),
  endAt: z.date().optional(),
  location: z.string().max(500).optional(),
}).refine(
  (data) => {
    if (data.endAt) {
      return data.endAt > data.startAt
    }
    return true
  },
  { message: "End time must be after start time" }
)

// Feed query schemas
export const feedQuerySchema = z.object({
  channelId: z.string().cuid().optional(),
  filter: z.enum(['all', 'supported', 'active', 'expired', 'starred']).default('all'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    { message: "Must be a valid file" }
  ).refine(
    (file) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',')
      return allowedTypes.includes(file.type)
    },
    { message: "File type not allowed" }
  ).refine(
    (file) => {
      const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880')
      return file.size <= maxSize
    },
    { message: "File size too large" }
  ),
})

// Environment validation
export const envSchema = z.object({
  DATABASE_URL: z.string(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  UPLOAD_DIR: z.string().default('./public/uploads'),
  MAX_FILE_SIZE: z.string().default('5242880'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),
  APP_NAME: z.string().default('MartianTinder'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  DEFAULT_CHANNEL_THRESHOLD: z.string().default('3'),
  DEFAULT_PROPOSAL_EXPIRY_DAYS: z.string().default('7'),
}) 