# RallyPoint Pickleball Hub

Trinidad and Tobago's pickleball booking, equipment store, and rewards platform.

**AIT Assignment 2 Prototype** -- Kimberly Beharry (2435447), CIS041-3

## Tech Stack

- Next.js 16.2.4 (App Router, TypeScript)
- Tailwind CSS 4
- lucide-react (icons)
- React Context + localStorage (cart state)
- No database -- all mock data in `src/lib/data.ts`

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page -- hero, feature cards, how it works, CTA |
| `/store` | Equipment store -- 6 products, category filter, search, add to cart |
| `/booking` | Court booking -- week calendar, 3 courts x 12 time slots, pre-booked slots |
| `/checkout` | Unified checkout -- products + bookings, qty controls, mock Stripe test mode |
| `/dashboard` | User dashboard -- points balance, Silver/Gold tiers, activity, recommendations |

## Key Files

```
src/
  lib/
    data.ts            # All mock data (products, courts, slots, user, recommendations)
    cart-context.tsx    # Global cart state (React context + localStorage)
  components/
    Nav.tsx             # Sticky navigation with cart badge
  app/
    layout.tsx          # Root layout with CartProvider
    page.tsx            # Landing page
    store/page.tsx      # Equipment store
    booking/page.tsx    # Court booking
    checkout/page.tsx   # Checkout + mock payment
    dashboard/page.tsx  # User dashboard + rewards
```

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Building

```bash
npm run build
```

All 5 routes compile as static pages (no server-side data fetching needed).

## Deployment

Target: Vercel (https://rallypoint-pickleball-hub.vercel.app)

1. Import this repo in Vercel
2. No environment variables needed (mock data only)
3. Framework: Next.js (auto-detected)

## Design Decisions

- **Green-700 primary palette** -- brand colour for RallyPoint
- **No real payment processing** -- mock Stripe card (4242...) for demo purposes
- **localStorage cart** -- persists across page refreshes without a backend
- **Pre-booked slots** -- 7 hardcoded slots to demonstrate unavailable state
- **Points system** -- Silver (200 pts) / Gold (500 pts) tiers, purely visual

## What This Demonstrates (AIT A2)

1. Court booking with real-time availability grid
2. Equipment store with search and category filtering
3. Unified cart (products + bookings in one checkout)
4. Loyalty/rewards dashboard with tier progression
5. Responsive design for mobile and desktop
6. Mock payment flow with confirmation
