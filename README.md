# RallyPoint Pickleball Hub

Trinidad and Tobago's pickleball booking, equipment store, and rewards platform.

**AIT Assignment 2 Prototype** -- Kimberly Beharry (2435447), CIS041-3

Live: https://rallypoint-pickleball-hub.vercel.app

## Tech Stack

- Next.js 16.2.4 (App Router, TypeScript, React Server Components)
- PostgreSQL (Neon) via Prisma 7 ORM
- NextAuth v5 (Google OAuth + credentials with bcrypt)
- Stripe (test mode) for payment processing
- Resend for transactional email (booking confirmations, cancellation notices)
- Tailwind CSS 4
- Zod for input validation
- lucide-react (icons)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page -- hero, feature cards, how it works, CTA |
| `/store` | Equipment store -- 6 products, category filter, search, add to cart |
| `/store/[id]` | Product detail -- sport-specific attributes, skill level, stock count |
| `/booking` | Court booking -- week calendar, 3 courts x 12 time slots, real-time slot availability |
| `/checkout` | Unified checkout -- products + bookings in one cart, Stripe test mode |
| `/login` | Sign in with email/password or Google OAuth |
| `/register` | Create account with optional referral code, 1,000 welcome points |
| `/dashboard` | User dashboard -- points balance, tier progress, activity feed, recommendations |
| `/dashboard/orders` | Order and booking history with cancellation |
| `/admin` | Operator panel -- product management, booking overview |

## Key Files

```
prisma/
  schema.prisma          # 13+ models: User, Product, Court, TimeSlot, Booking,
                         # Order, OrderItem, CartItem, PointsEvent, Challenge,
                         # UserChallenge, Referral, Account, Session
  seed.ts                # Database seed (products, courts, time slots, challenges)
src/
  auth.ts                # NextAuth v5 config (Google OAuth + credentials)
  auth.config.ts         # Auth edge config
  db.ts                  # Prisma client initialisation
  middleware.ts          # Auth middleware for protected routes
  lib/
    actions/
      admin.ts           # Admin server actions (product CRUD, booking management)
      auth.ts            # Registration, referral code validation
      bookings.ts        # Court slot hold, release, availability queries
      dashboard.ts       # Points, tier calculation, challenge progress
      orders.ts          # Unified checkout, stock decrement, email confirmation
      products.ts        # Product queries, recommendations engine
    cart-context.tsx      # Client-side cart state (synced with server CartItem table)
    dal.ts               # Data access layer helpers
    data.ts              # Fallback/seed data definitions
    email.ts             # Resend email templates (booking, order, cancellation)
    schemas.ts           # Zod validation schemas for all form inputs
  app/
    (auth)/              # Auth route group (login, register)
    admin/               # Admin panel with _components
    booking/             # Court booking with calendar
    checkout/            # Unified cart checkout
    dashboard/           # User dashboard + order history
    store/               # Product listing + [id] detail pages
```

## Running Locally

```bash
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Requires environment variables (see below). Open http://localhost:3000.

## Environment Variables

```
DATABASE_URL=            # Neon PostgreSQL connection string
AUTH_SECRET=             # NextAuth session secret
AUTH_GOOGLE_ID=          # Google OAuth client ID
AUTH_GOOGLE_SECRET=      # Google OAuth client secret
STRIPE_SECRET_KEY=       # Stripe secret key (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Stripe publishable key (test mode)
RESEND_API_KEY=          # Resend API key for transactional email
```

## Building

```bash
npm run build
```

Uses dynamic server-side rendering (Server Components with database queries). Not static.

## Deployment

Target: Vercel (https://rallypoint-pickleball-hub.vercel.app)

1. Import this repo in Vercel
2. Set all environment variables listed above
3. Framework: Next.js (auto-detected)
4. Prisma generates on build via `postinstall` script

## Design Decisions

- **Teal-600 primary palette** -- RallyPoint brand colour (#0D9488)
- **Server-side cart persistence** -- CartItem table in PostgreSQL (replaces original localStorage approach)
- **Prisma transactions** -- `$transaction()` with `@@unique([courtId, date, startTime])` constraint prevents double-booking
- **JWT session strategy** -- NextAuth v5 with PrismaAdapter for user persistence, JWT for stateless sessions
- **Content-based recommendations** -- matches products by category, skill level, and purchase history; collaborative filtering planned for Semester 2
- **Points ledger** -- PointsEvent model tracks all point changes (purchases, bookings, referrals, cancellations); Silver (200 pts) / Gold (500 pts) tiers with real progression
- **Stripe test mode** -- real PaymentIntent fields in schema; test card (4242...) for demo checkout
- **Referral system** -- 8-character codes, 250 points to sender on recipient's first purchase

## What This Demonstrates (AIT A2)

1. Court booking with real-time availability and slot-hold mechanism
2. Equipment store with search, category filtering, and sport-specific attributes
3. Unified cart (products + bookings in one checkout)
4. Loyalty/rewards dashboard with real tier progression and points ledger
5. Content-based personalised recommendations
6. Gamification engine with challenges and referral system
7. Admin panel for operator management
8. Responsive design for mobile and desktop
9. Transactional email confirmations (booking, order, cancellation)
10. Google OAuth and credentials authentication with bcrypt
