# DreamMap - AI-Powered Personal Development Application

## Overview

DreamMap is a comprehensive personal development platform that combines habit tracking, AI-powered recommendations, and community accountability features. The application helps users define their ideal self, track progress through habits and daily check-ins, and receive personalized guidance through AI-generated insights and recommendations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with:

- **Frontend**: React with TypeScript using Vite as the build tool
- **Backend**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Structure**: Organized into pages, components, and UI components following shadcn/ui patterns
- **Styling**: Tailwind CSS with custom design system including CSS variables for theming
- **Type Safety**: Full TypeScript implementation with shared schema types
- **State Management**: React Query for API state, local React state for UI interactions

### Backend Architecture
- **API Design**: RESTful Express.js server with route handlers for all major entities
- **Data Layer**: Drizzle ORM providing type-safe database operations
- **AI Service**: Mock AI service layer for generating recommendations and assessment responses
- **Storage Interface**: Abstracted storage layer for potential database switching

### Database Design
The PostgreSQL schema includes:
- **Users**: Core user profiles with progress tracking
- **Assessments**: "Ideal self" and "current self" evaluations with dimensional scoring
- **Habits**: User-defined habits with tracking metadata
- **Habit Logs**: Daily completion records
- **Daily Check-ins**: Mood, energy, and reflection entries
- **AI Recommendations**: Personalized suggestions with priority scoring
- **Community Features**: Accountability buddies and community updates

## Data Flow

1. **Onboarding Flow**: Users complete ideal-self and current-self assessments
2. **AI Processing**: Mock AI service generates recommendations based on assessment gaps
3. **Habit Creation**: Users create habits aligned with their goals
4. **Daily Tracking**: Habit completion and mood check-ins update user progress
5. **Progress Analysis**: System calculates streaks, completion rates, and overall progress
6. **Community Engagement**: Users can share progress and connect with accountability partners

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL) via `@neondatabase/serverless`
- **ORM**: Drizzle ORM with Zod validation schemas
- **UI Components**: Extensive Radix UI primitives via shadcn/ui
- **Styling**: Tailwind CSS with PostCSS processing
- **Build Tools**: Vite for frontend, esbuild for backend bundling

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Replit Integration**: Custom plugins for development environment
- **Session Management**: PostgreSQL-based sessions via `connect-pg-simple`

## Deployment Strategy

The application is designed for deployment on platforms supporting Node.js:

- **Build Process**: 
  - Frontend: Vite builds to `dist/public`
  - Backend: esbuild bundles server code to `dist/index.js`
- **Environment Variables**: Database URL required for PostgreSQL connection
- **Database Migrations**: Drizzle Kit handles schema migrations via `db:push` command
- **Production Setup**: Single-command deployment with built assets served statically

### Development vs Production
- Development uses Vite dev server with HMR
- Production serves pre-built static assets from Express
- Mock AI service provides realistic responses for development/testing
- Shared TypeScript types ensure consistency between frontend and backend

The architecture supports easy extension with real AI services, additional database providers, and enhanced community features while maintaining type safety and developer experience.