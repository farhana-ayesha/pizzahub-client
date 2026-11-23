# PizzaHub — Client

A warm, responsive pizza ordering and delivery marketplace built with the Next.js App Router.
Customers browse and order from local pizza shops, vendors manage menus, orders and their
Premium plan, and admins review users, menu submissions and transactions.

- Client repository: <https://github.com/farhana-ayesha/pizzahub-client>
- Server repository: <https://github.com/farhana-ayesha/pizzahub-server>
- Live website: add the deployed client URL here after deploying (for example
  `https://pizzahub-client.vercel.app`). No live URL is committed because it depends on the
  operator's hosting account and environment variables.

## Important features

- Role-based public and private routing for customers, vendors and admins.
- Better Auth email/password sign-in, optional Google sign-in, password reset and change
  password.
- Server-backed data via `NEXT_PUBLIC_API_URL`: menu, orders, users, transactions, profile and
  subscription state all hydrate from the Express API and refresh after each mutation.
- A self-contained local demo mode when `NEXT_PUBLIC_API_URL` is empty (no fake payments —
  Premium checkout requires the API and Stripe).
- Public home page with animated hero, featured items, categories, benefits and testimonials.
- Browse menu with search, category, location and price filters plus ascending/descending price
  sorting, loading skeletons and empty states.
- Item details with image gallery, vendor information, favourites and an order dialog.
- Customer dashboard with order statistics, order history, cancellation and status timeline.
- Vendor dashboard with menu CRUD, admin approval status, availability toggles, order
  accept/reject, image upload through the API/ImgBB and Stripe subscription checkout.
- Admin dashboard with user search/filter/blocking, menu approval, deletion and read-only
  transactions.
- Profile settings with validation and password management.
- Stripe Checkout success/cancel pages that trust the server/webhook state, not the redirect.
- Responsive navbar/footer, dashboard sidebar, toast notifications, custom loading/error states
  and accessible shadcn-style components.

## Technology stack

| Area | Packages |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, `class-variance-authority`, `clsx`, `tailwind-merge` |
| Components | Radix UI primitives, shadcn-style local components, `lucide-react` |
| Motion | `motion` (Framer Motion) |
| Notifications | `sonner` |
| Auth/API | Better Auth REST endpoints, `fetch`, JWT-compatible API |
| Media | ImgBB upload proxy through the API (optional browser key fallback) |

## Requirements

- Node.js 20+
- The PizzaHub server running (recommended), or no server for local demo mode

## Local setup

```bash
npm install
cp .env.example .env
# set NEXT_PUBLIC_API_URL to the server URL
npm run dev
```

Open `http://localhost:3000`.

Scripts:

```bash
npm run dev    # development server
npm run build  # production build + TypeScript checks
npm start      # serve the production build
npm run lint   # ESLint (includes React Compiler checks)
```

## Environment variables

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Express API base URL, for example `http://localhost:4000`. Leave empty for local demo mode. |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Optional browser-side ImgBB fallback when the API is not used. Prefer the server's `IMGBB_API_KEY`. |

Never commit `.env` files or real credentials.

## Demo accounts

After running `npm run seed` in the server repository, these accounts are available:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@pizzahub.com` | `Password123` |
| Vendor (free) | `vendor@pizzahub.com` | `Password123` |
| Vendor (Premium) | `mario@woodfire.com` | `Password123` |
| Customer | `customer@pizzahub.com` | `Password123` |
| Blocked customer | `blocked@example.com` | `Password123` |

The admin email/password come from the server's `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment
variables. For a real deployment, change them before seeding.

## Stripe testing

1. Configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` on the server.
2. Sign in as a free vendor and open **Dashboard → Subscription → Upgrade to Premium**.
3. The client calls `POST /api/vendor/subscription/checkout` and redirects to the returned
   Stripe Checkout URL.
4. Use test card `4242 4242 4242 4242`, any future expiry and any CVC.
5. The success page shows Premium only after the server records a verified Stripe webhook
   transaction. The redirect alone never activates Premium.

## Google and ImgBB

- **Google:** enabled when the server has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; the
  client request is proxied through Better Auth.
- **ImgBB:** menu images are compressed in the browser and sent to `POST /api/upload`, which
  holds the API key server-side. If the server key is missing, the form keeps a compressed
  local preview and shows a visible warning instead of silently pretending the upload worked.

## Challenge implementation notes

- **Advanced search and sorting:** the menu page filters and sorts the approved/active
  collection it receives from `GET /api/state`; the server also exposes the same query
  parameters (`search`, `category`, `location`, `minPrice`, `maxPrice`, `sort`, `page`,
  `limit`) on `GET /api/menu`. The sort control supports price ascending and descending.
- **JWT / role verification:** every mutation goes through the Express API, which verifies the
  Better Auth session or a Bearer JWT, reloads the user's role and block state from MongoDB and
  applies role middleware plus resource ownership checks. Frontend guards only control the UI.
- **Reloads:** the auth session is restored from the server cookie before dashboards render, so
  refreshing a private route does not bounce a signed-in user back to login.

## Deployment

1. Deploy the server first and set its `CLIENT_URL` to the deployed client origin.
2. Set `NEXT_PUBLIC_API_URL` to the deployed API URL and build the client.
3. Configure Stripe webhooks, Google callback URLs and ImgBB on the server.
4. Run the seed once against the production database and record the admin credentials for the
   submission form.
