# Textbelt SMS Application

## Overview

This is a full-stack SMS messaging application built with React and Express.js that provides a web interface for sending SMS messages through the Textbelt API. The application features contact management, message composition, delivery tracking, and configurable settings. It uses a modern tech stack with TypeScript, TailwindCSS, and shadcn/ui components for a polished user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui component library built on Radix UI primitives with TailwindCSS for styling
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Configuration**: Vite with React plugin, custom aliases for clean imports, and development tools

### Backend Architecture
- **Runtime**: Node.js with Express.js framework using TypeScript
- **API Design**: RESTful API with dedicated routes for contacts, messages, and settings
- **Data Validation**: Zod schemas for request/response validation with automatic type inference
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Middleware**: Custom logging, JSON parsing, and error handling middleware

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM with Neon serverless driver
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Type Safety**: Drizzle-Zod integration for automatic schema validation from database types
- **Development Storage**: In-memory storage implementation for rapid development and testing

### Authentication and Authorization
- **Current State**: No authentication system implemented
- **Session Management**: Connect-pg-simple configured for PostgreSQL session storage (prepared for future auth)
- **Security**: CORS configured, input validation on all endpoints

### External Service Integrations
- **SMS Provider**: Textbelt API for SMS delivery with configurable endpoints
- **Database Hosting**: Neon serverless PostgreSQL for production database
- **Development Tools**: Replit integration for cloud development environment

### Key Architectural Decisions

**Monorepo Structure**: Single repository with shared types and schemas between client and server for type safety and code reuse. This eliminates type mismatches and reduces duplication.

**Component-Based UI**: shadcn/ui provides a comprehensive set of accessible, customizable components that maintain design consistency while allowing for easy theming and customization.

**Type-Safe Data Layer**: Drizzle ORM with Zod validation ensures end-to-end type safety from database to frontend, reducing runtime errors and improving developer experience.

**Abstracted Storage Interface**: IStorage interface allows for easy switching between storage implementations (memory, PostgreSQL) without changing business logic.

**Query-Based State Management**: TanStack Query handles all server state, providing automatic caching, background updates, and optimistic updates for a responsive user experience.

**Responsive Design**: Mobile-first approach with dedicated mobile navigation and responsive layouts using TailwindCSS breakpoints.