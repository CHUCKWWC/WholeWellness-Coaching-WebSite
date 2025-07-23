# Coach Onboarding Application

## Overview

This is a full-stack web application built for coach onboarding and management. The application provides a comprehensive platform for wellness coaches to manage their profiles, resources, client onboarding flows, and booking integrations. The system is designed with a modern tech stack including React, Node.js/Express, PostgreSQL with Drizzle ORM, and shadcn/ui components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom wellness-themed color palette
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **Database**: PostgreSQL with Neon serverless database
- **ORM**: Drizzle ORM with schema-first approach
- **File Uploads**: Multer for handling file and video uploads
- **API Design**: RESTful endpoints with proper error handling

## Key Components

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- **Coaches**: Profile information, credentials, ratings, and media
- **Clients**: Client information linked to coaches
- **Resources**: File uploads and documents
- **Video Library**: Topic-based video content
- **Sessions**: Booking and session management
- **Onboarding Forms**: Customizable client onboarding flows

### Authentication & Authorization
- Session-based authentication using connect-pg-simple
- Role-based access control for coaches and clients
- Secure file upload handling with type validation

### File Management
- Multer-based file upload system
- Support for images, videos, and documents
- File size limits and type validation
- Organized storage structure

### Core Features
1. **Coach Profile Management**: Complete profile creation with photos, videos, credentials
2. **Resource Library**: Upload and manage files, worksheets, and documents
3. **Video Library**: Topic-based video content organization
4. **Client Onboarding**: Customizable forms and onboarding flows
5. **Analytics Dashboard**: Performance metrics and client progress tracking
6. **Wix Integration**: Booking system integration with external scheduling

## Data Flow

### Client-Server Communication
1. Frontend makes API requests using TanStack Query
2. Express server handles routing and business logic
3. Drizzle ORM manages database interactions
4. Responses are cached client-side for optimal performance

### File Upload Flow
1. Client selects files through custom upload components
2. Files are validated on both client and server
3. Multer processes and stores files locally
4. Database stores file metadata and references

### Form Management
1. React Hook Form with Zod validation
2. Dynamic form creation for onboarding flows
3. Form responses stored and linked to clients
4. Progress tracking and analytics

## External Dependencies

### Core Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm and drizzle-kit for database management
- **UI**: Extensive Radix UI component library
- **Forms**: @hookform/resolvers with Zod validation
- **HTTP**: TanStack Query for server state management

### File Processing
- **Multer**: File upload middleware
- **File Types**: Support for images, videos, documents
- **Storage**: Local file system storage

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast production builds
- **Vite**: Development server and build tool
- **Tailwind CSS**: Utility-first styling

## Deployment Strategy

### Build Process
1. Frontend: Vite builds React app to `dist/public`
2. Backend: ESBuild bundles server code to `dist/index.js`
3. Database: Drizzle migrations applied via `db:push`

### Production Setup
- NODE_ENV=production for optimized builds
- Database migrations managed through Drizzle Kit
- Static assets served from Express server
- Environment variables for database and external API keys

### Development Workflow
- Hot module replacement through Vite
- Automatic server restart with tsx
- Database schema changes via Drizzle push
- Type checking across shared schemas

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 08, 2025. Initial setup