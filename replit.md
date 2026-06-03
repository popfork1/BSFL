# BSFL Fan Hub

## Overview

BSFL Fan Hub is a football league web application with a black and white theme. It provides live game scores, news updates, standings, playoff brackets, player stats, real-time chat, applications for league roles, and a support center. The platform supports both public viewing and admin authentication for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom black & white theme
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Real-time**: WebSocket server for live chat functionality
- **Authentication**: Session-based auth with PostgreSQL session store (supports admin and streamer roles)

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Driver**: postgres-js
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema management (`npm run db:push`)

### Pages & Routes
- `/` — Home (hero, featured games, latest news, quick links)
- `/scores` — Live & final scores
- `/schedule` — Weekly schedule
- `/playoffs` — Playoff bracket
- `/standings` — Team standings
- `/teams` — Team directory & detail pages
- `/stats` — Player stats (passing, rushing, receiving, defense)
- `/news` — News articles
- `/applications` — Apply for Staff, Media, Referee, Streamer, Franchise Owner roles
- `/support` — Discord invite, support ticket form, FAQ, contact info
- `/settings` — User preferences
- `/admin` — Admin dashboard (admin-only)
- `/login` — Login page

### Removed Features (from original URFL template)
- Pick'em predictions
- Betting / virtual coins system
- Partners/Sponsors page
- Changelogs/Updates page
- Archives (previous weeks)
- Update Planner

### Kept Features
- Live chat (game-specific)
- Admin panel (full content management)
- Win probability calculator
- Football field visualizer
- Play-by-play feed

### Build and Deployment
- **Development**: `npm run dev` runs Vite dev server with HMR on port 5000
- **Production Build**: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.js`

## External Dependencies

### Database
- PostgreSQL database (configured via `DATABASE_URL` environment variable)

### Session Management
- `connect-pg-simple`: PostgreSQL session store for Express sessions
- Sessions stored in `sessions` table

### Authentication
- Simple username/password authentication
- **Password Hashing**: bcrypt with 12 rounds
- Primary admin credentials via environment variables: `ADMIN_USERNAME`, `ADMIN_PASSWORD` (defaults: popfork1/dairyqueen12)
- Roles: "admin" (full access), "streamer" (stream links only), or "guest" (personal settings only)

### User Management API (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete a user

### Public Authentication API
- `POST /api/signup` - Create a guest account
- `POST /api/login` - Authenticate existing user
- `GET /api/logout` - End current session

### Third-Party UI Libraries
- Radix UI primitives for accessible components
- Lucide React for icons
- React Icons for Discord icon
- date-fns for date formatting
