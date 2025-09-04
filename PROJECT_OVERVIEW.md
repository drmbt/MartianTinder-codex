# MartianTinder - Project Overview

**Version**: MVP v0.1  
**Last Updated**: Initial Creation  
**Status**: Pre-Development

## Goals

### Vision
A locally hosted, auth-gated community app that lets people publish **Proposals**; others swipe to signal support, supersupport, opposition, or skip; once a threshold is met, the proposal graduates into a scheduled **Event** with Google Calendar sync and a purpose-built comms thread.

### Primary Goals
- Enable small groups and teams to coordinate and self-govern effectively
- Provide a simple, intuitive interface for community decision-making
- Integrate seamlessly with existing calendar workflows (Google Calendar)
- Support various types of community proposals beyond just events

### Stretch Goals
- Real-time Google Calendar API integration with OAuth
- Advanced scheduling with availability windows and slot voting
- PWA with offline capabilities
- AI-generated proposal images
- Advanced moderation and governance features

## MVP Scope (Must-Have Features)

### Authentication
- Email magic link authentication via Auth.js
- Configurable SMTP provider
- Basic session management

### Channels
- Create and join channels via simple invite links
- Channel-scoped proposal feeds (Discord-server-like privacy)
- Basic member roles: owner, moderator, member

### Proposals
- Draft → Publish workflow (immediate or scheduled)
- Core fields: title, note, capacity (min/max), threshold, visibility, anonymity settings
- Image upload support (local file system storage)
- External chat link integration (Telegram/WhatsApp/Signal/Slack)

### Support System
- Four signal types: Support, SuperSupport, Oppose, Skip, Dismiss
- Three visibility levels:
  - **Public**: Everyone in channel can see who supported
  - **Private**: Only proposal owner can see supporter identity
  - **Anonymous**: Completely invisible to proposal owner
- Configurable thresholds (0 = announcement mode, no threshold required)

### Feed Experience
- Channel-scoped, swipeable card interface
- FIFO ordering by default (user-configurable sorting/filtering later)
- Expired proposals moved to separate bucket
- Card design with image positioning and minimal text tools

### Events & Calendar
- Automatic event creation when proposals meet threshold
- ICS file generation for individual events and user feeds
- "Add to Google Calendar" template links (no OAuth required)
- Basic event management

### Dashboard
- User commitments (supported/supersupported proposals)
- Upcoming events
- Past events
- Starred proposals

## Nice-to-Have / Future Features

### Authentication & Security
- Google SSO integration
- Advanced permission systems

### Scheduling & Availability
- Calendly-style availability collection
- Time window proposals with slot voting
- Real Google Calendar OAuth + API write integration

### Enhanced UX
- PWA installation and offline caching
- Real-time updates via WebSockets
- Advanced feed filtering and sorting
- AI-generated proposal images

### Infrastructure
- PostgreSQL migration from SQLite
- Background job processing
- Advanced moderation tools
- Analytics and reporting

### Community Features
- Advanced governance tools
- Reputation systems
- Cross-channel discovery (with privacy controls)

## Technical Architecture

### Stack
- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **Database**: Prisma + SQLite (local development), PostgreSQL (production)
- **Authentication**: Auth.js with email magic links
- **Styling**: Tailwind CSS + shadcn/ui components
- **Validation**: Zod for input validation
- **Calendar**: ical-generator for ICS file creation
- **File Storage**: Local file system (configurable for cloud later)

### Architecture Principles
- Single process application (no separate API service)
- No background workers in MVP (status computed at read-time)
- Local-first development with easy cloud migration path
- Configurable external dependencies (SMTP, storage, etc.)

## Glossary

### Core Objects
- **Channel**: Topical or group space with invite-only access; contains proposals
- **Proposal**: Hypothesis or intention that may become an event if it earns enough support
- **Support Signal**: User response to proposal (Support/SuperSupport/Oppose/Skip/Dismiss)
- **Event**: Reified proposal after threshold is met and owner confirms
- **Thread**: Communication space linked to proposal (external chat integration)

### User Roles
- **Owner/Creator**: Creates and manages proposals; configures parameters and moderation
- **Supporter/Committer**: Expresses support signals; commits to events
- **Opponent/Hater**: Can express opposition; may be visible in separate cohort
- **Channel Admin**: Manages channel membership and settings

### States & Lifecycle
- **Draft**: Proposal being created by owner
- **Published**: Live proposal accepting signals
- **Threshold Met**: Enough support gathered, awaiting owner confirmation
- **Reified**: Confirmed as Event with calendar integration
- **Expired**: Time limit reached without meeting threshold

### Support Visibility Levels
- **Public**: Supporter identity visible to all channel members
- **Private**: Supporter identity visible only to proposal owner
- **Anonymous**: Support signal counted but identity hidden from everyone

### Proposal Types
Beyond events: vibe checks, petitions, norm setting, volunteer calls, rideshares, resource offers, social posts

## Development Phases

### Sprint 1: Foundation
- Next.js setup with TypeScript, Tailwind, shadcn/ui
- Prisma + SQLite configuration
- Auth.js magic link implementation
- Basic layout and navigation

### Sprint 2: Core Functionality
- Channel creation and management
- Proposal creation and publishing
- Basic feed with proposal cards

### Sprint 3: Interaction System
- Support signal implementation
- Threshold logic and confirmation flow
- Feed interaction (skip/dismiss/star)

### Sprint 4: Events & Calendar
- Event creation from proposals
- ICS file generation
- Google Calendar template links
- Dashboard implementation

### Sprint 5: Polish & Enhancement
- Image upload handling
- External chat link integration
- Advanced filtering
- Basic end-to-end testing

## Configuration Requirements

### Environment Variables
- SMTP configuration (provider, credentials)
- Database connection string
- Auth.js secret and configuration
- File upload directory path
- Google Calendar template URL base

### Default Settings
- Default proposal threshold: configurable per channel
- Default expiration time: configurable per channel
- Default visibility settings: configurable per channel
- Image upload size limits and formats 