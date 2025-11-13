# proconnect-jobtracker - AI-Powered Job Search Platform

A full-stack job search platform with AI-powered message generation, real-time notifications, and professional networking features.

## Features

- **Job Listings & Search** - Browse and search for job opportunities
- **AI Job Butler** - Generate recruiter messages using OpenAI (or fallback templates)
- **Real-time Updates** - Socket.IO-powered real-time job postings, applications, and messages
- **User Profiles** - Professional profiles with experience, education, and skills
- **Authentication** - JWT-based auth with registration and login
- **Resume Upload** - Upload and manage resumes
- **In-Memory & Database Storage** - Flexible storage: in-memory for dev, PostgreSQL for production

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Wouter, Radix UI, TanStack Query
- **Backend:** Node.js, Express, Socket.IO, TypeScript
- **Database:** PostgreSQL + Drizzle ORM (optional, falls back to in-memory)
- **LLM:** OpenAI API (optional, falls back to template messages)

## Quick Start

### Prerequisites

- Node.js v18+ (v22.x tested)
- PostgreSQL (optional, for production)
- OpenAI API key (optional, for AI features)

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- Frontend dev server (Vite) at `http://localhost:5173`

Expected output:
```
[storage] DATABASE_URL not set, using in-memory storage
✅ Database seeded successfully
11:53:33 PM [express] serving on port localhost:5000
```

### Environment Variables

Create a `.env` file in the project root (optional):

```env
# Backend Port
PORT=5000

# Database (optional - if not set, uses in-memory storage)
DATABASE_URL=postgresql://user:password@localhost:5432/codread

# JWT Secret for authentication
JWT_SECRET=your-secret-key-here

# OpenAI API Key (optional - if not set, uses template messages)
OPENAI_API_KEY=sk-...

# Node Environment
NODE_ENV=development
```

#### Environment Variable Guide

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `PORT` | number | `5000` | Backend server port |
| `DATABASE_URL` | string | *(not set)* | PostgreSQL connection string. If not set, uses in-memory storage. Format: `postgresql://user:password@host:port/dbname` |
| `JWT_SECRET` | string | `dev_jwt_secret` | Secret key for JWT token signing. Use a strong key in production. |
| `OPENAI_API_KEY` | string | *(not set)* | OpenAI API key for AI features. If not set, uses fallback template messages. |
| `NODE_ENV` | string | `development` | Node environment (`development` or `production`) |

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Post a new job
- `GET /api/jobs/search?query=...&location=...` - Search jobs

### Applications

- `POST /api/jobs/:jobId/apply` - Apply to a job
- `GET /api/applications` - Get user's applications

### Messages

- `POST /api/messages` - Send a message
- `GET /api/messages/:userId` - Get messages with a user

### AI Job Butler

- `POST /api/ai/generate-message` - Generate a recruiter message using AI
- `POST /api/ai/send-message` - Send an AI-generated message

### Notifications

- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

## Demo Scripts

### Running the JobTracker Demo (Standalone)

The project includes a standalone JobTracker demo that can run independently:

**CommonJS version:**
```bash
npm run demo:cjs
```

**ES Module version:**
```bash
npm run demo:esm
```

Both run on `http://localhost:4000` by default.

## Database Setup (PostgreSQL)

### Using Drizzle with PostgreSQL

1. **Set DATABASE_URL:**
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/codread"
   ```

2. **Run migrations:**
   ```bash
   npm run db:push
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

The server will automatically switch to PostgreSQL storage when `DATABASE_URL` is set.

### Schema

The database uses Drizzle ORM with the following tables:
- `users` - User accounts
- `experiences` - Work experience
- `education` - Education history
- `skills` - User skills
- `connections` - User connections/network
- `jobs` - Job postings
- `job_applications` - Job applications
- `saved_jobs` - Saved job listings
- `messages` - Direct messages
- `notifications` - User notifications

See `shared/schema.ts` for the full schema definition.

## AI Features

### Enabling AI Job Butler

1. **Set your OpenAI API key:**
   ```bash
   export OPENAI_API_KEY="sk-..."
   ```

2. **Restart the server:**
   ```bash
   npm run dev
   ```

3. **Use the AI endpoints:**
   - POST `/api/ai/generate-message` to generate a message
   - POST `/api/ai/send-message` to send it

**Fallback:** If `OPENAI_API_KEY` is not set, the system uses predefined template messages.

## Windows-Specific Notes

### Port Already in Use Error

If you see `Error: listen EADDRINUSE: address already in use 0.0.0.0:5000`:

```powershell
# Find the process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F

# Restart the server
npm run dev
```

### reusePort Issue

On Windows, `SO_REUSEPORT` is not supported. The server automatically disables it on Windows systems. No manual configuration needed.

## Building for Production

```bash
npm run build
npm run start
```

This bundles the backend with esbuild and serves the production build.

## Troubleshooting

### "DATABASE_URL not set, using in-memory storage"

This is normal for development. To use PostgreSQL:
1. Set up a PostgreSQL database
2. Add `DATABASE_URL` to your environment
3. Run `npm run db:push` to apply migrations
4. Restart the server

### "Cannot find module 'jsonwebtoken'"

Run:
```bash
npm install --save-dev @types/jsonwebtoken
```

### Socket.IO Connection Issues

Ensure your client is connecting to the correct server URL. By default:
- Dev: `http://localhost:5000`
- Production: Your deployed URL

### Port Already in Use

See the **Windows-Specific Notes** section above.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main app with routes
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities, API calls, hooks
│   └── index.html
├── server/                # Node.js backend
│   ├── index.ts           # App bootstrap
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Storage abstraction (Mem or Drizzle)
│   ├── drizzleStorage.ts  # PostgreSQL implementation
│   ├── ai.ts              # OpenAI wrapper
│   └── seed.ts            # Database seeding
├── shared/                # Shared code
│   └── schema.ts          # Drizzle schema & types
├── drizzle.config.ts      # Drizzle configuration
├── vite.config.ts         # Vite configuration
└── package.json
```

## Development

### Type Checking

```bash
npm run check
```

### Linting & Formatting

Use VS Code with recommended extensions (ESLint, Prettier).

## License

MIT
