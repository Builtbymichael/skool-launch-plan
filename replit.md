# Skool Launch Plan Creator

## Overview

A production-ready MVP web application that helps users turn a topic or skill into a practical launch blueprint for a Skool community or course. The app generates AI-powered launch plans including positioning, naming ideas, pricing strategy, a 7-day launch plan, and copyable content. Users can email plans to themselves and are encouraged to start a free Skool trial via an affiliate link.

The application follows a full-stack TypeScript architecture with a React frontend and Express backend, using PostgreSQL for data persistence and OpenAI for AI-powered plan generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React Hook Form for form handling
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **Server**: Node.js with HTTP server
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **AI Integration**: OpenAI API for generating Skool launch plans with structured JSON output
- **Email Delivery**: Resend API for sending plans via email (optional feature)

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Tables**:
  - `rate_limits`: Per-user daily generation limits (user hash + date key)
  - `daily_usage`: Global daily usage tracking
  - `topic_searches`: Analytics for searched topics
  - `conversations` / `messages`: Chat functionality (Replit integrations)

### Rate Limiting
- User-based: 3 generations per day per anonymized user hash
- Global: 100 total generations per day
- User identification via hashed IP + User-Agent combination

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`)
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Validation**: Zod schemas with drizzle-zod integration for type-safe form validation
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Static file serving from built `dist/public`

### Build Configuration
- **Development**: `tsx server/index.ts` with Vite middleware
- **Production Build**: esbuild for server bundling, Vite for client bundling
- **Database Migrations**: Drizzle Kit with `db:push` command

## External Dependencies

### AI Services
- **OpenAI API**: Plan generation via `gpt-4` or similar model
  - Environment: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Replit AI Integrations support for audio, image, and chat features

### Email Service
- **Resend**: Transactional email delivery for emailing plans
  - Environment: `RESEND_API_KEY`, `FROM_EMAIL`

### Database
- **PostgreSQL**: Primary data store
  - Environment: `DATABASE_URL`
  - Connection via `pg` Pool with Drizzle ORM

### Third-Party Links
- **Skool Affiliate**: Configurable affiliate URL for Skool signups
  - Environment: `SKOOL_AFFILIATE_URL`

### Security
- **Admin Access**: Password-protected admin dashboard
  - Environment: `ADMIN_PASSWORD`, `HASH_SALT`