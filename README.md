# SaaS Platform

A production-ready SaaS web application with a marketing site, client portal, and admin/worker dashboards. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase, and Stripe.

## Architecture

| System | Description |
|---|---|
| **Marketing Site** | Public pages — Home, Pricing, Login/Signup |
| **Client Portal** | Authenticated clients — Submit tasks, track progress, download deliverables, manage billing |
| **Admin Dashboard** | Admin users — Manage clients, assign tasks to workers, review internal work |
| **Worker Dashboard** | Worker users — View assigned tasks, upload deliverables, submit for review |

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, React 19
- **Styling:** Tailwind CSS v4 with CSS-variable design tokens
- **Backend:** Supabase (Auth, Postgres, Storage, Realtime)
- **Payments:** Stripe (subscriptions, checkout, billing portal)
- **No external UI frameworks** — custom components only

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account

### 1. Clone and install

```bash
git clone <repo-url>
cd saas-platform
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (server-only) |
| `STRIPE_SECRET_KEY` | Stripe secret key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (starts with `whsec_`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (starts with `pk_`) |
| `STRIPE_PRICE_ID_PLAN_A` | Stripe Price ID for Plan A ($3,500/month) |
| `STRIPE_PRICE_ID_PLAN_B` | Stripe Price ID for Plan B ($5,500/month) |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g. `http://localhost:3000`) |

### 3. Set up the database

Run the SQL schema in your Supabase SQL editor:

```bash
# File: supabase/schema.sql
```

This creates all tables, enums, indexes, RLS policies, storage buckets, triggers, and seed data for the marketing site.

### 4. Set up Stripe

1. Create two Products in your Stripe dashboard:
   - **Plan A** — $3,500/month recurring
   - **Plan B** — $5,500/month recurring
2. Copy each product's **Price ID** into your `.env.local`
3. Set up a webhook endpoint pointing to `https://your-domain.com/api/stripe/webhook`
4. Subscribe to these events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`

For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── (marketing)/          # Public pages (Home, Pricing)
│   ├── (auth)/               # Login, Signup, Auth callback
│   ├── portal/               # Client portal (authenticated)
│   │   ├── tasks/            # Task list, new task, task detail
│   │   ├── deliverables/     # Completed task library
│   │   └── billing/          # Subscription management
│   ├── admin/                # Admin dashboard (role: admin)
│   │   ├── clients/          # Client list and detail
│   │   └── tasks/            # All tasks, task detail with controls
│   ├── worker/               # Worker dashboard (role: worker)
│   │   └── tasks/            # Assigned tasks, task detail
│   └── api/
│       └── stripe/           # Checkout, webhook, billing portal
├── components/
│   ├── ui/                   # Reusable UI primitives
│   └── layout/               # Sidebar, Topbar, Nav, Footer
├── hooks/                    # useUser, useRealtime
├── lib/
│   ├── supabase/             # Client, server, middleware helpers
│   ├── stripe.ts             # Stripe instance and helpers
│   └── utils.ts              # Formatting, class merging
└── types/                    # TypeScript types and DB types
```

## Database Schema

See `supabase/schema.sql` for the full schema. Key tables:

| Table | Purpose |
|---|---|
| `users` | User profiles linked to Supabase Auth |
| `clients` | Client records with Stripe subscription data |
| `tasks` | Task submissions with status workflow |
| `task_files` | File attachments (briefs + deliverables) |
| `comments` | Discussion threads on tasks |
| `status_updates` | Audit trail of status changes |
| `site_content` | CMS content for marketing pages |
| `pricing_tiers` | Pricing plan definitions |
| `faqs` | FAQ entries |

## Task Workflow

```
submitted → in_progress → internal_review → client_review → completed
                ↑                                    │
                └────────────── (revisions) ─────────┘
```

1. **Client** submits a task → `submitted`
2. **Admin** assigns to worker, sets `in_progress`
3. **Worker** uploads deliverables, submits → `internal_review`
4. **Admin** reviews:
   - Approve → `client_review`
   - Request changes → `in_progress`
5. **Client** reviews:
   - Approve → `completed`
   - Request revisions → `in_progress`

## Role-Based Access

| Role | Access |
|---|---|
| `client` | Own tasks, deliverables, billing |
| `worker` | Assigned tasks only |
| `admin` | Everything |

Enforced via Supabase RLS policies and Next.js middleware.

## Real-time Features

Task updates, comments, and status changes are pushed in real-time via Supabase Realtime subscriptions.

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Set all environment variables in your Vercel project settings. Update `NEXT_PUBLIC_APP_URL` to your production domain.
