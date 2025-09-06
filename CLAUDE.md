# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build production bundle
npm run lint         # Run ESLint CLI (uses eslint . instead of deprecated next lint)
npm run type-check   # Run TypeScript compiler check (tsc --noEmit)
```

### Database
```bash
npm run db:push      # Push Prisma schema to database (development)
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations in development
npm run db:migrate:deploy # Deploy migrations in production
npm run db:studio    # Open Prisma Studio for database inspection
npm run db:reset     # Reset database and re-run migrations
```

### Testing
- Currently no automated test suite configured
- Use TypeScript for compile-time validation
- Manual testing via development server

## High-Level Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router (never use Pages Router)
- **Database**: Prisma ORM + SQLite with migrations (development), PostgreSQL-ready
- **Auth**: Auth.js v5 with email magic links (no passwords)
- **UI**: Tailwind CSS v4 + shadcn/ui components (dark mode support)
  - Using modern Tailwind v4 imports: `@import "tailwindcss"`
  - Semantic color system with automatic dark mode adaptation
  - Progress bars and status colors defined as utility classes
- **TypeScript**: ES2022 target with strict mode
- **Linting**: ESLint CLI with flat config (migrated from deprecated next lint)
- **File Storage**: Local filesystem with abstraction for future cloud migration
- **Image Processing**: Sharp for optimization (3 sizes per upload)
- **Environment**: Validated with Zod schema (lib/env.ts)

### Core Business Models

#### Navigation Structure (5-Tab Mobile-First)
1. **FEED Tab**: Tinder-style swiping for uninteracted proposals
2. **ACTIVITY Tab**: Chronological list of user's interactions  
3. **PROPOSE Tab**: User's own proposals management
4. **CALENDAR Tab**: Day/Week/Month views with proposal/event visualization
5. **USER Tab**: Profile management and settings

#### Data Flow
- **Proposals** → Support threshold met → Owner confirmation → **Events**
- Support signals: Support/SuperSupport/Oppose/Skip/Dismiss
- Visibility levels: Public/Private/Anonymous
- Channel-scoped feeds (Discord-like privacy model)

### Key API Routes
```
/api/auth/*                  # Authentication (Auth.js)
/api/channels               # Channel CRUD
/api/proposals              # Proposal CRUD  
/api/proposals/[id]/signal  # Support signals
/api/proposals/[id]/state   # User state (skip/dismiss/star)
/api/proposals/[id]/reify   # Convert to event
/api/feed                   # Channel feed with filtering
/api/upload                 # Image upload with Sharp optimization
```

### Database Schema Highlights
- **User**: Core user model with profile images gallery support
- **Channel**: Discord-like containers for proposals
- **Proposal**: Core content with threshold mechanics and multi-image support
- **SupportSignal**: User support/oppose actions with visibility levels
- **ProposalUserState**: Tracks skip/dismiss/star states
- **Event**: Reified proposals with calendar integration
- **Image Models**: UserImage, ProposalImage, EventImage for galleries

### File Organization
```
app/                    # Next.js App Router pages
├── api/               # API routes
├── (auth tabs)/       # Main 5-tab pages (feed, activity, propose, calendar, profile)
└── p/[id]/           # Proposal detail pages

components/
├── features/          # Feature-specific components
│   ├── feed/         # Tinder feed implementation
│   ├── proposals/    # Proposal forms and cards
│   └── calendar/     # Calendar views
├── layout/           # Navigation and layout
└── ui/               # shadcn/ui base components

lib/                   # Utilities and shared logic
├── auth.ts           # Auth.js configuration
├── prisma.ts         # Database client
├── upload.ts         # Image upload/optimization
└── validations.ts    # Zod schemas

types/                 # TypeScript type definitions
```

### Current Development Status
- **Sprint 5 In Progress**: Mobile UX Polish & Advanced Features
- **Recently Completed**: Media upload infrastructure with Sharp optimization
- **Known Gap**: Uploaded images stored but not displayed in proposal details, feed cards, or profiles

### Key Development Patterns
- **Optimistic UI**: Immediate feedback for user interactions
- **FIFO Feed**: Uninteracted proposals shown in order
- **Computed Status**: Proposal status calculated at read-time (no background jobs)
- **Mobile-First**: All UI designed for mobile with desktop enhancements
- **Type Safety**: Zod schemas for runtime validation + TypeScript

### Important Constraints
- No background workers/job queues in MVP
- Local file storage only (prepare abstraction for cloud)
- Email magic links only (no OAuth providers yet)
- SQLite for development (schema compatible with PostgreSQL)
- Compute all status at read-time (no cached/stored status)

### Business Logic Rules
- **Proposals with threshold=0**: Function as announcements (no support required)
- **Support visibility levels**: Public (everyone sees), Private (only owner sees), Anonymous (invisible to owner)
- **Feed ordering**: FIFO by default, expired items in separate bucket
- **Proposal → Event flow**: Requires owner confirmation after threshold met
- **Channel privacy**: Discord-like invite-only access to proposals

### Code Standards & Patterns
- **TypeScript**: Strict mode, avoid 'any', use Zod for runtime validation
- **Components**: Functional only, separate business/presentation logic
  - Prefer small, modular, composable components over monolithic React components
  - Extract often-repeated Tailwind classes into reusable components
  - Use shadcn/ui components when available instead of building custom ones
- **Styling**: 
  - Use Tailwind CSS v4 classes exclusively, avoid inline styles
  - Replace opacity utilities like `bg-opacity-50` with modern syntax `bg-black/50`
  - Use arbitrary value support when needed (e.g., `min-h-[200px]`)
  - Avoid manual CSS unless absolutely necessary
  - **Color Usage**: NEVER use hardcoded colors like `text-gray-500` or `bg-orange-100`
    - Use semantic theme colors: `text-foreground`, `text-muted-foreground`, `bg-background`, `bg-muted`
    - For status colors, use utility classes with dark mode support:
      - Success: `status-success` or add both `bg-green-100 dark:bg-green-900/20`
      - Error: `status-error` or add both `bg-red-100 dark:bg-red-900/20`
      - Warning: `status-warning` or add both `bg-yellow-100 dark:bg-yellow-900/20`
      - Info: `status-info` or add both `bg-blue-100 dark:bg-blue-900/20`
    - For progress bars: use `progress-bar` and `progress-fill` classes
    - Always provide dark mode alternatives when using color classes
- **API Routes**: Zod validation, consistent response formats, proper HTTP codes
- **Database**: Always use Prisma Client, transactions for multi-step operations
- **File naming**: kebab-case files, PascalCase components, camelCase functions
- **Security**: Validate all inputs, auth guards, sanitize user content

### Common Development Tasks
When implementing features:
1. Load `PROJECT_OVERVIEW.md` first for business logic
2. Check `TODO.md` for sprint status and priorities
3. Review recent git commits to understand progress
4. Use existing patterns from similar components
5. Validate with Zod schemas in `lib/validations.ts`
6. Follow mobile-first responsive design
7. Implement optimistic UI for user interactions
8. Add proper loading and error states
9. Include visual indicators for required form fields (*)
10. Display Zod validation errors inline with form fields
11. Use semantic color classes instead of hardcoded colors

YOU MUST run `npx tsc --noEmit` after significant chunks of work to check for typescript errors and subsequently fix them.
YOU MUST run `npm run lint` once you have a stable base without ts errors.
DO NOT RUN `build`, `npm run build`, etc unprompted. the dev server is already running and compile time errors are caught by the above.
