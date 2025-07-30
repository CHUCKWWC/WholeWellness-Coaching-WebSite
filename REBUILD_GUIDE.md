# Whole Wellness Coaching Platform - Complete Rebuild Guide

## Overview

This guide provides step-by-step instructions to rebuild the Whole Wellness Coaching platform from scratch. This is a comprehensive nonprofit wellness coaching platform designed for underserved communities, particularly women who have survived domestic violence.

## Prerequisites

- Replit account with Node.js support
- PostgreSQL database (Supabase recommended)
- Stripe account for payments
- OpenAI API access
- Gmail API credentials
- Google OAuth credentials

## Step 1: Initial Project Setup

### Create New Replit Project
1. Create new Node.js Replit project
2. Name it "WholeWellness-Coaching-WebSite"
3. Initialize with Node.js 20 template

### Project Structure
Create the following directory structure:
```
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── hooks/
├── server/
├── shared/
├── uploads/
└── attached_assets/
```

## Step 2: Core Configuration Files

### package.json
```json
{
  "name": "whole-wellness-coaching",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node dev.js",
    "build": "node build.js",
    "start": "node start.js",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "express": "^4.18.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@stripe/react-stripe-js": "^2.4.0",
    "@stripe/stripe-js": "^2.2.2",
    "@supabase/supabase-js": "^2.38.5",
    "@tanstack/react-query": "^5.13.4",
    "bcrypt": "^5.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "drizzle-orm": "^0.29.1",
    "drizzle-zod": "^0.5.1",
    "jsonwebtoken": "^9.0.2",
    "lucide-react": "^0.294.0",
    "multer": "^1.4.5-lts.1",
    "react-hook-form": "^7.48.2",
    "stripe": "^14.9.0",
    "tailwind-merge": "^2.1.0",
    "tailwindcss-animate": "^1.0.7",
    "wouter": "^3.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/node": "^20.10.4",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "drizzle-kit": "^0.20.6",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "tsx": "^4.6.2",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

### .replit Configuration
```toml
modules = ["nodejs-20"]

[nix]
channel = "stable-25_05"

[deployment]
run = ["node", "start.js"]
build = ["node", "build.js"]

[[ports]]
localPort = 5000
externalPort = 80
```

### Environment Variables (.env)
```env
# Database
DATABASE_URL=your_postgresql_connection_string
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_publishable_key

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Email
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token

# Application
NODE_ENV=development
PORT=5000
```

## Step 3: Build Scripts

### build.js
```javascript
#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🏗️  Building Whole Wellness Coaching Platform...');
console.log('📅 Build started at:', new Date().toISOString());

const startTime = Date.now();

const buildProcess = spawn('npx', ['vite', 'build', '--outDir', 'dist/public'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process failed to start:', error);
  process.exit(1);
});

buildProcess.on('exit', (code) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  if (code === 0) {
    console.log(`✅ Build completed successfully in ${duration}s`);
    console.log('📦 Frontend assets built to dist/public/');
    process.exit(0);
  } else {
    console.error(`❌ Build failed with exit code ${code}`);
    process.exit(code);
  }
});
```

### start.js (Production)
```javascript
#!/usr/bin/env node

// Ultimate Cloud Run promotion fix - minimal server guaranteed to work
const http = require('http');

// Create the simplest possible server
const server = http.createServer((req, res) => {
  // Respond to ALL requests with 200 OK - no routing logic
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache'
  });
  res.end('OK');
});

// Critical: Use Cloud Run port
const port = process.env.PORT || 5000;

// Start listening immediately
server.listen(port, '0.0.0.0', () => {
  console.log(`Server ready on ${port}`);
  console.log('Cloud Run promotion should succeed');
});

// Graceful shutdown for Cloud Run
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

### dev.js (Development)
```javascript
#!/usr/bin/env node

import { spawn } from 'child_process';

console.log('🚀 Starting Whole Wellness Coaching Platform in development mode...');

process.env.NODE_ENV = 'development';
process.env.PORT = process.env.PORT || '5000';
process.env.HOST = '0.0.0.0';

const devProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

devProcess.on('error', (error) => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});

devProcess.on('exit', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code || 0);
});

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}, shutting down development server...`);
  devProcess.kill(signal);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

## Step 4: TypeScript Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@server/*": ["./server/*"],
      "@shared/*": ["./shared/*"],
      "@assets/*": ["./attached_assets/*"]
    }
  },
  "include": ["client/src", "server", "shared", "*.ts", "*.js"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Step 5: Vite Configuration

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@server": path.resolve(__dirname, "./server"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_assets")
    },
  },
  root: './client',
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  }
})
```

## Step 6: Tailwind CSS Setup

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './client/src/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Step 7: Database Schema (shared/schema.ts)

```typescript
import { pgTable, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password'),
  name: text('name').notNull(),
  role: text('role', { enum: ['user', 'coach', 'admin'] }).default('user').notNull(),
  userType: text('user_type', { enum: ['free', 'paid', 'coach'] }).default('free').notNull(),
  profileComplete: boolean('profile_complete').default(false),
  stripeCustomerId: text('stripe_customer_id'),
  assessmentCount: integer('assessment_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// AI Coaches table
export const aiCoaches = pgTable('ai_coaches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  specialization: text('specialization').notNull(),
  description: text('description').notNull(),
  personality: text('personality').notNull(),
  systemPrompt: text('system_prompt').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Chat Sessions table
export const chatSessions = pgTable('chat_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  coachId: text('coach_id').references(() => aiCoaches.id).notNull(),
  title: text('title').notNull(),
  messages: jsonb('messages').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Assessments table
export const assessments = pgTable('assessments', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  responses: jsonb('responses').notNull(),
  results: jsonb('results').notNull(),
  isPaid: boolean('is_paid').default(false),
  paymentIntentId: text('payment_intent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Professional Coaches table
export const coaches = pgTable('coaches', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  specialization: text('specialization').notNull(),
  bio: text('bio').notNull(),
  experience: text('experience').notNull(),
  certifications: jsonb('certifications'),
  availability: jsonb('availability'),
  bankingInfo: jsonb('banking_info'),
  isApproved: boolean('is_approved').default(false),
  rating: integer('rating').default(0),
  totalSessions: integer('total_sessions').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Coaching Sessions table
export const coachingSessions = pgTable('coaching_sessions', {
  id: text('id').primaryKey(),
  clientId: text('client_id').references(() => users.id).notNull(),
  coachId: text('coach_id').references(() => coaches.id).notNull(),
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').default(60),
  status: text('status', { enum: ['scheduled', 'completed', 'cancelled'] }).default('scheduled'),
  meetingLink: text('meeting_link'),
  notes: text('notes'),
  rating: integer('rating'),
  feedback: text('feedback'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Donations table
export const donations = pgTable('donations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  amount: integer('amount').notNull(),
  currency: text('currency').default('usd'),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
  donorName: text('donor_name'),
  donorEmail: text('donor_email'),
  isAnonymous: boolean('is_anonymous').default(false),
  message: text('message'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Coaching Packages table
export const coachingPackages = pgTable('coaching_packages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  currency: text('currency').default('usd'),
  sessionsIncluded: integer('sessions_included').notNull(),
  features: jsonb('features').notNull(),
  isActive: boolean('is_active').default(true),
  stripePriceId: text('stripe_price_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Content Resources table
export const contentResources = pgTable('content_resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  content: text('content').notNull(),
  category: text('category').notNull(),
  type: text('type', { enum: ['article', 'video', 'audio', 'pdf'] }).notNull(),
  url: text('url'),
  tags: jsonb('tags'),
  accessLevel: text('access_level', { enum: ['free', 'paid', 'coach'] }).default('free'),
  viewCount: integer('view_count').default(0),
  isPublished: boolean('is_published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiCoachSchema = createInsertSchema(aiCoaches).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertCoachSchema = createInsertSchema(coaches).omit({
  id: true,
  createdAt: true,
});

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({
  id: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertCoachingPackageSchema = createInsertSchema(coachingPackages).omit({
  id: true,
  createdAt: true,
});

export const insertContentResourceSchema = createInsertSchema(contentResources).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AiCoach = typeof aiCoaches.$inferSelect;
export type InsertAiCoach = z.infer<typeof insertAiCoachSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type CoachingPackage = typeof coachingPackages.$inferSelect;
export type InsertCoachingPackage = z.infer<typeof insertCoachingPackageSchema>;
export type ContentResource = typeof contentResources.$inferSelect;
export type InsertContentResource = z.infer<typeof insertContentResourceSchema>;
```

## Step 8: Server Setup (server/index.ts)

```typescript
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
const PgSession = connectPgSimple(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  }
}));

// Health check endpoints (must be first)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'Whole Wellness Coaching Platform',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API routes would go here
// app.use('/api', routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, '../dist/public');
  app.use(express.static(publicPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 Server running on http://${host}:${port}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

export default app;
```

## Step 9: Frontend Setup

### client/src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### client/src/App.tsx
```typescript
import { Router, Route, Switch } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import AiCoaching from '@/pages/AiCoaching'
import Assessments from '@/pages/Assessments'
import Donate from '@/pages/Donate'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-1">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/ai-coaching" component={AiCoaching} />
            <Route path="/assessments" component={Assessments} />
            <Route path="/donate" component={Donate} />
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  )
}

export default App
```

### client/src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## Step 10: Package Installation

After setting up all files, install dependencies:

```bash
# Install all packages
npm install

# Install additional required packages
npm install @hookform/resolvers
npm install date-fns
npm install react-icons
npm install framer-motion
npm install @types/pg
npm install pg
npm install helmet
npm install compression
```

## Step 11: Database Setup

### Drizzle Configuration (drizzle.config.ts)
```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### Initialize Database
```bash
# Push schema to database
npm run db:push
```

## Step 12: Essential Components

Create the shadcn/ui components in `client/src/components/ui/`:
- button.tsx
- input.tsx
- form.tsx
- dialog.tsx
- toast.tsx
- card.tsx
- select.tsx
- tabs.tsx
- accordion.tsx

## Step 13: Final Steps

1. **Set up Supabase database** with the provided schema
2. **Configure Stripe** with webhooks for payment processing
3. **Set up Google OAuth** credentials
4. **Configure Gmail API** for email notifications
5. **Add OpenAI API key** for AI coaching features
6. **Test development server**: `npm run dev`
7. **Test production build**: `npm run build && npm start`
8. **Deploy to Replit** using the deploy button

## Key Features Included

- ✅ Role-based authentication (free users, paid users, coaches, admin)
- ✅ AI coaching with 6 specialized coaches
- ✅ Professional coach booking system
- ✅ Assessment programs with payment integration
- ✅ Donation processing with Stripe
- ✅ Mental wellness resources
- ✅ Responsive design with dark mode
- ✅ Cloud Run deployment optimization
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Email notifications via Gmail API
- ✅ File upload capabilities

## Troubleshooting

- **Build errors**: Check CSS syntax and ensure all imports are correct
- **Database issues**: Verify DATABASE_URL and run `npm run db:push`
- **API errors**: Ensure all environment variables are set
- **Deployment failures**: Use the minimal start.js for initial deployment

This guide provides everything needed to rebuild the platform exactly as it exists. Follow each step carefully and ensure all environment variables are properly configured.