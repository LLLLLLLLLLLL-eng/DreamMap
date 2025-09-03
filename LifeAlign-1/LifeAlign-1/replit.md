# Overview

Congruence is a mobile-first web application designed to help users stay aligned with their long-term goals and identity through AI-driven questioning, habit creation, and progress tracking. The app guides users through creating a personal "blueprint" that captures their identity goals, current state, and focus areas, then generates personalized habits to help them become who they want to be.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with a comprehensive design system using CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and data fetching
- **PWA Support**: Configured as a Progressive Web App with manifest.json and mobile-first responsive design

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL with connection pooling
- **Session Management**: Express sessions with PostgreSQL session store

## Authentication System
- **Provider**: Replit Authentication using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration

## Database Schema Design
- **Users Table**: Stores user profile information from Replit Auth
- **Blueprints Table**: Stores AI-generated personal blueprints with identity goals, current state, and focus areas
- **Habits Table**: Stores user habits with categories, priorities, and AI-generated flags
- **Habit Completions Table**: Tracks daily habit completion with date-based records
- **Progress Assessments Table**: Stores periodic progress evaluations and insights
- **Sessions Table**: Manages user session persistence

## AI Integration
- **Provider**: OpenAI API with GPT-4o model
- **Blueprint Generation**: AI analyzes user responses to create personalized identity blueprints
- **Habit Creation**: AI generates relevant habits based on user blueprints and focus areas
- **Blueprint Refinement**: AI can adjust blueprints based on user feedback and progress

## Application Flow
- **Onboarding**: Multi-step questionnaire that feeds into AI blueprint generation
- **Dashboard**: Central hub displaying identity goals, daily habits, and progress overview
- **Habit Tracking**: Daily habit completion with streak tracking and progress visualization
- **Blueprint Management**: View and refine personal blueprints with AI assistance
- **Progress Tracking**: Analytics and insights on habit completion and goal alignment

## Development Environment
- **Build System**: Vite with hot module replacement for development
- **Type Checking**: TypeScript with strict configuration
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Error Handling**: Comprehensive error boundaries and API error management

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

## AI Services
- **OpenAI API**: GPT-4o model for blueprint generation, habit creation, and content refinement

## Authentication
- **Replit Auth**: OpenID Connect authentication provider for user management

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing library
- **Zod**: Runtime type validation for API requests and responses
- **React Hook Form**: Form management with validation

## Deployment
- **Replit**: Hosting platform with integrated development environment
- **Vite**: Build tool for optimized production bundles
- **ESBuild**: Fast bundling for server-side code