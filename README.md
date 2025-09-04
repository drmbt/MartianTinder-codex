# MartianTinder

A community organization app that lets people publish **Proposals**, signal support through swipe-like interactions, and turn popular proposals into scheduled **Events** with calendar integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18+ (recommended: 20+)
- npm or yarn

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - Set `NEXTAUTH_SECRET` to a random string
   - Configure SMTP settings for email authentication (optional for development)
   - Other settings have sensible defaults

3. **Initialize database:**
   ```bash
   npm run db:push
   npm run db:generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Optional: Database Management
- **View database:** `npm run db:studio`
- **Reset database:** `npm run db:reset`

## 📋 Current Status

### ✅ Completed (Sprint 1)
- Next.js 15 setup with TypeScript and App Router
- Prisma + SQLite database configuration
- Auth.js email magic link authentication
- Basic layout and navigation
- Core API routes for channels
- shadcn/ui component library integration

### 🚧 In Progress
- Channel management UI
- Proposal creation and feed
- Support signal system

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Database**: Prisma + SQLite (development) → PostgreSQL (production)
- **Authentication**: Auth.js with email magic links
- **UI**: Tailwind CSS + shadcn/ui components
- **Validation**: Zod schemas
- **Calendar**: ical-generator for ICS files

### Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── channels/          # Channel pages
│   ├── proposals/         # Proposal pages
│   └── dashboard/         # User dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## 📖 Documentation

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**: Complete project specification
- **[TODO.md](./TODO.md)**: Sprint board and development progress
- **[.cursorrules](./.cursorrules)**: Development guidelines for AI assistants

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database
- `npm run type-check` - Run TypeScript type checking

## 🎯 Next Steps

1. Configure SMTP in `.env` for email authentication
2. Create your first channel via the UI
3. Start building proposals and testing the feed

Check `TODO.md` for detailed development roadmap.

## 📄 License

[Add your license here]
