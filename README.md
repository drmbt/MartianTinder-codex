# MartianTinder 🚀

Community organization app for coordinating proposals and events.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up database**
   ```bash
   npm run db:push
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Open http://localhost:3000**

## What it does

- **Channels**: Create invite-only spaces for your community
- **Proposals**: Share ideas that can become events
- **Support Signals**: Swipe-style voting on proposals
- **Events**: Turn popular proposals into calendar events

## Authentication

Uses email magic links (no passwords). Magic links are logged to console during development.

## Tech Stack

- Next.js 15 + TypeScript
- Prisma + SQLite
- NextAuth v5
- Tailwind + shadcn/ui

## Documentation

- `PROJECT_OVERVIEW.md` - Complete specification
- `TODO.md` - Development progress
- `.cursorrules` - Development guidelines

Built for small communities to coordinate and self-organize.
