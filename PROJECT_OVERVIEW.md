# MartianTinder - Project Overview

**Version**: MVP v0.3  
**Last Updated**: Post-Sprint 5 UI/UX Polish  
**Status**: Sprint 5 In Progress (Mobile UX & Advanced Features)

## Goals

### Vision
A mobile-first, auth-gated community app with a 5-tab interface that lets people publish **Proposals**; others swipe through a Tinder-style feed to signal support, supersupport, opposition, or dismiss; once a threshold is met, the proposal graduates into a scheduled **Event** with automatic Google Calendar integration and purpose-built comms threads.

### Primary Goals
- Enable small groups and teams to coordinate and self-govern effectively through intuitive mobile-first UX
- Provide a seamless "Tinder for proposals" discovery experience with comprehensive activity tracking
- Integrate deeply with Google Calendar workflows for both proposal visibility and automatic event creation
- Support various community coordination needs beyond just event planning

### Stretch Goals
- Real-time Google Calendar API integration with OAuth for automatic event creation
- Advanced scheduling with availability windows and slot voting
- PWA with offline capabilities and push notifications
- AI-generated proposal images and content suggestions
- Advanced moderation, governance, and reputation features

## MVP Scope (Must-Have Features)

### Core Navigation Architecture
**5-Tab Bottom Navigation (Mobile-First)**:

1. **FEED Tab** (Default/Landing)
   - Full-card Tinder-style swiping interface for uninteracted proposals
   - Discovery settings: filter by channels, recency (24h), threshold status, etc.
   - Four-directional actions: Support, SuperSupport, Oppose, Dismiss

2. **ACTIVITY Tab**
   - Chronological list of user's interactions (mini-cards with thumbnails)
   - Status emoji coding for interaction type (support/oppose/dismiss)
   - Support progress indicators on each card
   - Filtering: supported/opposed, keywords, channels

3. **PROPOSE Tab**
   - List of user's own proposals (same mini-card format as Activity)
   - Filters: All, Active, Supported (threshold met), Expired, Drafts
   - Central floating "+" button for new proposal creation

4. **CALENDAR Tab**
   - Day/Week/Month views with proposal and event visualization
   - Outline cards: Proposals with event times (potential events)
   - Solid cards: Reified events (threshold met, confirmed)
   - Filter: Show only supported/participating events (default)

5. **USER Tab**
   - Personal profile management (bio, photos, links, social handles)
   - Settings and preferences configuration
   - Integration management (Google Calendar, Discord, etc.)

### Authentication
- Email magic link authentication via Auth.js v5
- Configurable SMTP provider with console fallback
- Session management and protected routes

### Channels & Community
- Create and join channels via simple invite links
- Channel-scoped proposal feeds (Discord-server-like privacy)
- Basic member roles: owner, moderator, member
- Automatic channel calendar creation in Google Calendar

### Proposals & Publishing
- Advanced Draft → Publish → Schedule workflow with date/time pickers
- Core fields: title, note, capacity (min/max), threshold, visibility, anonymity
- Suggested event timing field for calendar integration
- Image upload support (local file system storage)
- External chat link integration (Telegram/WhatsApp/Signal/Slack)
- Owner controls: edit, delete, reification confirmation

### Support & Interaction System
- Five signal types: Support, SuperSupport, Oppose, Skip, Dismiss
- Three visibility levels:
  - **Public**: Everyone in channel can see who supported
  - **Private**: Only proposal owner can see supporter identity  
  - **Anonymous**: Completely invisible to proposal owner
- Configurable thresholds (0 = announcement mode)
- Optimistic UI with real-time feedback
- Complete user state tracking (ProposalUserState model)

### Feed & Discovery Experience
- Primary feed shows only uninteracted proposals (true inbox model)
- Tinder-style one-at-a-time card swiping with keyboard support
- FIFO ordering with user-configurable filtering
- Automatic removal after interaction with progress tracking
- Separate buckets: active, expired, drafts, supported

### Events & Calendar Integration
**Enhanced Google Calendar Strategy**:
- **Channel Calendars**: Auto-create shared Google Calendar per channel
- **Proposal Visibility**: All proposals with event times appear as outline/transparent events
- **Automatic Reification**: Threshold-met proposals auto-add to users' personal calendars
- **Dual Calendar System**: 
  - Channel calendar shows all proposals (filterable)
  - Personal calendar shows only confirmed events user is participating in
- ICS file generation for individual events and user feeds
- "Add to Google Calendar" template links (no OAuth required for MVP)

### Activity & Profile Management
- Comprehensive activity tracking with interaction history
- User commitments dashboard (supported/supersupported proposals)
- Upcoming and past events with participation status
- Personal profile with bio, photos, social links
- Settings for calendar integration and notification preferences

## Nice-to-Have / Future Features

### Enhanced Calendar Integration
- Real Google Calendar OAuth + API write integration
- Calendly-style availability collection and slot voting
- Automatic calendar conflict detection
- Calendar sync with external services (Outlook, Apple Calendar)

### Advanced UX & Mobile Features
- PWA installation with offline caching
- Push notifications for threshold met, event reminders
- Real-time updates via WebSockets
- Advanced feed filtering, sorting, and search
- AI-generated proposal images and content suggestions
- Voice-to-text proposal creation

### Community & Governance
- Advanced moderation tools and content policies
- Reputation systems and user verification
- Cross-channel discovery (with privacy controls)
- Analytics and community health dashboards
- Advanced governance tools (voting, delegation, etc.)

### Infrastructure & Scale
- PostgreSQL migration from SQLite
- Background job processing for notifications
- Cloud storage integration for images
- Multi-tenant architecture for organizations
- Advanced security and audit logging

## Technical Architecture

### Stack
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Database**: Prisma + SQLite (development), PostgreSQL (production)
- **Authentication**: Auth.js v5 with email magic links
- **Styling**: Tailwind CSS v4 + shadcn/ui components (dark mode support)
- **Validation**: Zod for input validation with inline error display
- **Linting**: ESLint CLI with flat config (migrated from next lint)
- **Calendar**: ical-generator for ICS file creation
- **File Storage**: Local file system (configurable for cloud migration)

### Architecture Principles
- Mobile-first responsive design with 5-tab bottom navigation
- Single process application (no separate API service)
- No background workers in MVP (status computed at read-time)
- Local-first development with easy cloud migration path
- Configurable external dependencies (SMTP, storage, calendar)
- Optimistic UI patterns for immediate user feedback

### Database Schema (8 Models)
- **User**: Authentication and profile data
- **Channel**: Community spaces with invite codes
- **Proposal**: Core content with lifecycle management
- **SupportSignal**: User interactions with proposals
- **ProposalUserState**: Skip/dismiss/star tracking
- **Event**: Reified proposals with calendar data
- **Account/Session/VerificationToken**: Auth.js integration

## Glossary

### Core Objects
- **Channel**: Community space with invite-only access and shared calendar
- **Proposal**: Content that may become an event if it earns enough support
- **Support Signal**: User response (Support/SuperSupport/Oppose/Skip/Dismiss)
- **Event**: Reified proposal after threshold met and owner confirms
- **Activity**: User's interaction history with proposals
- **Feed**: Discovery interface showing uninteracted proposals

### User Interface Elements
- **Feed Tab**: Tinder-style discovery interface (primary landing)
- **Activity Tab**: Chronological interaction history
- **Propose Tab**: User's own proposals with management controls
- **Calendar Tab**: Temporal view of proposals and events
- **User Tab**: Profile and settings management

### User Roles & States
- **Owner/Creator**: Creates and manages proposals, confirms reification
- **Supporter/Committer**: Expresses support signals, commits to events
- **Opponent**: Can express opposition with visibility controls
- **Channel Admin**: Manages channel membership and settings

### Proposal Lifecycle
- **Draft**: Being created by owner (not visible to others)
- **Published**: Live and accepting signals from channel members
- **Threshold Met**: Enough support gathered, awaiting owner confirmation
- **Reified**: Confirmed as Event with calendar integration
- **Expired**: Time limit reached without meeting threshold

### Support Visibility Levels
- **Public**: Supporter identity visible to all channel members
- **Private**: Supporter identity visible only to proposal owner
- **Anonymous**: Support signal counted but identity hidden from everyone

### Proposal Types & Use Cases
Events, vibe checks, petitions, norm setting, volunteer calls, rideshares, resource offers, social coordination, community decisions

## Development Phases

### ✅ Sprint 1: Foundation & Authentication (COMPLETE)
- Next.js 15 setup with TypeScript, Tailwind, shadcn/ui
- Prisma + SQLite configuration with complete schema
- Auth.js v5 magic link implementation
- Basic layout, navigation, and protected routes

### ✅ Sprint 2: Channels & Proposals (COMPLETE)
- Channel creation, management, and invite system
- Proposal creation with draft/publish/schedule workflow
- Basic feed with proposal cards and detail views
- API routes for all CRUD operations

### ✅ Sprint 3: Support & Interaction System (COMPLETE)
- Complete support signal system with optimistic UI
- Tinder-style feed with four-directional actions
- Proposal state tracking and archive system
- Owner controls (edit/delete) with confirmation flows
- Advanced filtering and feed architecture

### 🔄 Sprint 4: Events & Calendar Integration (IN PROGRESS)
- Event model and reification logic completion
- Google Calendar integration strategy implementation
- ICS file generation for events and user feeds
- Calendar tab with day/week/month views
- Dashboard enhancement with events overview

### ⏳ Sprint 5: 5-Tab Navigation & Polish
- Complete 5-tab bottom navigation implementation
- Mobile-first UI/UX polish and optimization
- Image upload handling and external chat integration
- Advanced filtering and search capabilities
- Performance optimization and error handling

### ⏳ Sprint 6: Enhanced Features & Testing
- User profile management and settings
- Advanced calendar features and integration
- End-to-end testing with Playwright
- Performance monitoring and optimization
- Production deployment preparation

## Configuration Requirements

### Environment Variables
- **Authentication**: `AUTH_SECRET`, `NEXTAUTH_URL`
- **SMTP**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- **Database**: `DATABASE_URL` (SQLite dev, PostgreSQL prod)
- **File Storage**: `UPLOAD_DIR`, `MAX_FILE_SIZE`
- **Calendar**: `GOOGLE_CALENDAR_TEMPLATE_URL`

### Default Settings
- Default proposal threshold: configurable per channel
- Default expiration time: configurable per channel  
- Default visibility settings: configurable per channel
- Image upload size limits and supported formats
- Calendar integration preferences per user

## Current Status (Post-Sprint 5 Session 6)

### ✅ Completed Features
- Complete authentication and session management
- Full channel system with invite codes
- Comprehensive proposal lifecycle (draft/publish/schedule/edit/delete)
- True Tinder-style feed with optimistic UI
- Complete support signal system with threshold detection
- Owner confirmation flow for event reification
- Multiple feed types (main, drafts, expired, channel-specific)
- **NEW: Full dark mode support with semantic color system**
- **NEW: Zod form validation with inline error messages**
- **NEW: Required field indicators throughout forms**
- **NEW: Media upload infrastructure with Sharp optimization**
- **NEW: Multi-image gallery component with swipe navigation**

### 🎯 Next Priorities (Sprint 5 Continuation)
1. **Image Display Integration**: Show uploaded images in proposal details and feed cards
2. **Mobile UX Polish**: Enhanced touch interactions and animations
3. **5-Tab Navigation Refinement**: Swipe gestures between tabs
4. **Calendar Integration**: Complete Google Calendar strategy
5. **Profile Gallery**: User profile image management 