# WholeWellness Coaching Platform

A comprehensive nonprofit digital solution providing life coaching services to underserved individuals, particularly women who have survived domestic violence.

## 🌟 Features

- **AI-Powered Coaching**: 6 specialized AI coaches with ChatGPT-style interface
- **Professional Coach Management**: Complete coach onboarding, scheduling, and video sessions
- **Conversation Intelligence**: Daily/weekly chat summaries with personalized email digests
- **Crisis Detection**: Mental health keyword monitoring with automatic admin alerts
- **Donation & Membership System**: Stripe integration with tiered membership
- **Admin Dashboard**: Role-based access with analytics and user management
- **Member Portal**: Secure registration, progress tracking, and resource library

## 🚀 Quick Start

### Prerequisites

- Node.js 20.x
- PostgreSQL database (Supabase/Neon)
- Environment variables (see `.env.example`)

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Setup

```bash
# Push schema changes to database
npm run db:push
```

## 📁 Project Structure

```
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (TypeScript)
├── shared/          # Shared types and schemas (Drizzle ORM)
├── docs/            # Documentation files
└── scripts/         # Build and deployment scripts
```

## 🔧 Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + Radix UI
- TanStack Query for state management
- Wouter for routing

**Backend:**
- Node.js + Express
- TypeScript with ES modules
- Drizzle ORM + PostgreSQL
- JWT authentication
- SendGrid for emails
- OpenAI for AI coaching

**Infrastructure:**
- Replit (primary hosting)
- Supabase (database)
- Stripe (payments)
- 100ms (video conferencing)

## 📚 Documentation

See the [docs/](./docs) folder for detailed documentation:

- [Deployment Guide](./docs/REPLIT_DEPLOYMENT_GUIDE.md)
- [Performance Optimization](./docs/PERFORMANCE_OPTIMIZATION_SUMMARY.md)
- [UX Implementation](./docs/UX_AUDIT_IMPLEMENTATION_REPORT.md)
- [Conversation Intelligence](./docs/CONVERSATION_INTELLIGENCE_SETUP.md)

## 🔒 Security

- Helmet middleware for CSP and security headers
- CORS with strict origin allowlist
- Rate limiting on sensitive endpoints
- Environment-based secret management
- Service Worker with cache security

## 🤝 Contributing

This is a nonprofit project. Contributions are welcome! Please ensure:

1. All TypeScript code passes type checking (`npm run check`)
2. Code follows existing patterns and conventions
3. New features include appropriate documentation

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
- Check the [docs/](./docs) folder
- Review closed issues on GitHub
- Contact the development team

---

Built with ❤️ to support survivors and promote wellness
