# DailyPaper

A streak-based research paper reading app for CS students. Every day you get one paper based on your selected topics, read an AI-generated summary, then answer a 5-question quiz to keep your streak alive.

## How it works

1. Sign up and pick topics you care about (Computer Science, Math, Physics, Biology, and more)
2. Each day DailyPaper picks a fresh arXiv paper from one of your topics
3. Read the AI-generated summary + open the full paper on arXiv
4. Click "I'm Done Reading" and take a 5-question quiz
5. Score ≥ 3/5 to extend your streak

Papers refresh at local midnight. You won't see the same paper twice.

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Routing | react-router-dom v7 |
| Auth | Clerk (`@clerk/clerk-react`, `@clerk/backend`) |
| Backend | Node.js, Express, TypeScript, tsx |
| Database | PostgreSQL + Prisma ORM |
| AI | Groq API (`llama-3.3-70b-versatile`) |
| Papers | arXiv public API (no key needed) |
| Icons | Lucide React |

## Project structure

```
dailypaper/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx         # Today's paper + CTA
│       │   ├── Onboarding.tsx   # First-time topic selection
│       │   ├── Quiz.tsx         # 5-question quiz
│       │   ├── Result.tsx       # Score + streak result
│       │   ├── History.tsx      # Past 30 daily papers
│       │   ├── Topics.tsx       # Manage topic preferences
│       │   └── Resources.tsx    # Guide: how to read a paper
│       ├── hooks/
│       │   ├── useDaily.ts      # Fetches today's paper, refreshes at midnight
│       │   ├── useTheme.ts      # Dark/light mode toggle
│       │   └── useUser.ts       # User profile + streak
│       ├── components/
│       │   ├── Navbar.tsx
│       │   ├── StreakBadge.tsx
│       │   └── LoadingSpinner.tsx
│       └── lib/api.ts           # Typed API client
│
└── server/                  # Express + Prisma backend
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.ts              # 86 topics across 8 domains
    └── src/
        ├── routes/
        │   ├── daily.ts         # GET/POST /daily, /daily/quiz
        │   ├── topics.ts        # GET /topics, PUT /topics/me
        │   ├── users.ts         # GET /users/me, /users/me/history
        │   └── webhooks.ts      # Clerk user.created webhook
        ├── services/
        │   ├── arxiv.ts         # arXiv API client (XML parsing)
        │   ├── ai.ts            # Groq summary + quiz generation
        │   └── dailyPaper.ts    # Core daily paper logic + streak
        └── middleware/auth.ts   # Clerk JWT verification
```

## API

All `/daily`, `/users`, and `/topics/me` routes require a Clerk JWT in `Authorization: Bearer <token>`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/topics` | All available topics |
| `PUT` | `/topics/me` | Save user's selected topics |
| `GET` | `/daily` | Get or create today's paper |
| `POST` | `/daily/complete` | Mark paper as read |
| `GET` | `/daily/quiz` | Get quiz questions (requires completed reading) |
| `POST` | `/daily/quiz/submit` | Submit answers `{ answers: number[] }` |
| `GET` | `/users/me` | User profile + streak + topics |
| `GET` | `/users/me/history` | Last 30 daily papers |
| `POST` | `/webhooks/clerk` | Clerk webhook (creates user on signup) |

## Database schema

```
User          id, email, streak, lastActive
Topic         id, name, arxivCategory
UserTopic     userId ↔ topicId  (many-to-many)
Paper         id, title, authors, abstract, arxivUrl, publishedAt, summary (AI), quiz (JSON)
DailyPaper    userId, date, paperId, completed, score  — unique(userId, date)
```

## Environment variables

**server/.env**
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
GROQ_API_KEY=gsk_...
CLIENT_URL=http://localhost:5173   # optional, default shown
PORT=3001                          # optional
```

**client/.env**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_URL=http://localhost:3001  # optional, default shown
```

## Setup

**Prerequisites:** Node.js 18+, PostgreSQL

```bash
# 1. Clone and install
git clone <repo>
cd dailypaper
npm install --prefix client
npm install --prefix server

# 2. Configure environment
cp server/.env.example server/.env   # fill in your keys
cp client/.env.example client/.env

# 3. Push DB schema and seed topics
cd server
npx prisma db push
npx prisma db seed

# 4. Run
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Open `http://localhost:5173`. Sign up, pick topics, and get your first paper.

## Topics

86 topics across 8 domains seeded from arXiv categories:

- **Computer Science** — ML, CV, NLP, Systems, Algorithms, Security, and more
- **Mathematics** — Algebra, Analysis, Combinatorics, Geometry, etc.
- **Statistics** — ML Theory, Bayesian Methods, Causal Inference, etc.
- **Physics** — Quantum, Condensed Matter, High Energy, etc.
- **Astrophysics** — Cosmology, Exoplanets, Stellar, etc.
- **Biology** — Genomics, Neuroscience, Bioinformatics, etc.
- **Electrical Engineering** — Signal Processing, Information Theory, Robotics, etc.
- **Economics** — Game Theory, Econometrics, Finance, etc.
