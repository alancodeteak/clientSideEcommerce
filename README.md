# Client-side ecommerce API (clean architecture)

Express API with **domain → application → adapters → interface** layering. The composition root is `src/main/composition.js`.

The database schema matches the unified multi-tenant ecommerce script: `migrations/000_unified_schema.sql` (same as the main `backend` migration). Tenant-scoped reads use Postgres **RLS** via `set_config('app.current_shop_id', …)` before querying.

## Layout

| Layer | Role |
|--------|------|
| `domain/` | Domain errors (`AppError`, `NotFoundError`, `ValidationError`, `AuthError`, `ConflictError`) |
| `application/ports/` | Repository interfaces (contracts) |
| `application/usecases/` | Application services (catalog, auth, health) |
| `adapters/` | Postgres repositories |
| `infra/db/` | Connection pool, transactions (`withTx` / `withClient`), tenant session helper |
| `infra/auth`, `infra/security` | JWT (customer tokens), password hashing |
| `interface/http/` | Express routes, controllers, validation middleware |
| `main/` | `bootstrap.js` entry, `server.js`, `composition.js` (wiring) |

## Environment

Copy `.env.example` to `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — min 16 characters (required non-default in production)
- `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_EXPIRES_IN` — optional; defaults suit local dev

## Database

```bash
cp .env.example .env
# edit DATABASE_URL and JWT_*
npm install
npm run db:migrate
npm run dev
```

Ensure a **shop** row exists (e.g. from admin backend or SQL) before calling customer auth.

## API

### Health

- `GET /health` — liveness

### Customer auth

Identity uses `users` (credentials), `customers` (profile, one per user), and `customer_shop_memberships` (shop scope). JWT payload includes `role: "customer"`, `shopId`, and `customerId`.

**Register** — `POST /api/auth/register` (201)

Body (provide **`shopSlug`** or **`shopId`**):

```json
{
  "shopSlug": "my-shop",
  "email": "buyer@example.com",
  "password": "secret12",
  "displayName": "Alex"
}
```

Response:

```json
{
  "accessToken": "<jwt>",
  "role": "customer",
  "user": { "id": "<uuid>", "email": "buyer@example.com" },
  "shop": { "id": "<uuid>", "slug": "my-shop", "name": "My Shop" },
  "customer": { "id": "<uuid>" }
}
```

If the email already exists, the same password must be supplied; the service either completes membership for this shop or returns `409` when already registered for that shop.

**Login** — `POST /api/auth/login`

```json
{
  "shopSlug": "my-shop",
  "email": "buyer@example.com",
  "password": "secret12"
}
```

Response shape matches register (200).

### Catalog (tenant-scoped)

- `GET /api/catalog/items?shopId=<uuid>` — active products for that shop (or header **`x-shop-id`**)

Default port: **4100** (see `.env.example`).
