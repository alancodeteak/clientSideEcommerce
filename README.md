# Client-side ecommerce API (clean architecture)

Express API with **domain → application → adapters → interface** layering. The composition root is `src/main/composition.js`.

**Frontend / integration:** see the API reference at [docs/client-storefront-api.md](../docs/client-storefront-api.md).

The database schema matches `migrations/001_deployment_postgresql.sql` (same as `backend/migrations/001_deployment_postgresql.sql`). Apply it with `npm run db:migrate` (or `psql -f`). To drop tables not in that file (after a backup), use **`npm run db:prune`**. Tenant-scoped reads use Postgres **RLS** via `set_config('app.current_shop_id', …)` before querying.

## Layout

| Layer | Role |
|--------|------|
| `domain/` | Domain errors (`AppError`, `NotFoundError`, `ValidationError`, `AuthError`, `ConflictError`) |
| `application/ports/` | Repository interfaces (contracts) |
| `application/usecases/` | Application services (catalog, auth, health) |
| `adapters/` | Postgres repositories |
| `infra/db/` | Connection pool, transactions (`withTx` / `withClient`), tenant session helper |
| `infra/security` | JWT (customer tokens), password hashing |
| `interface/http/` | Express routes, controllers, validation middleware |
| `main/` | `bootstrap.js` entry, `server.js`, `composition.js` (wiring) |

## Environment

Copy `.env.example` to `.env` and set at least:

- `DATABASE_URL` — PostgreSQL connection string (**optional in development**: defaults to `postgresql://localhost:5432/postgres` if unset). **Required in production.**
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

## Postman

1. Import [postman/ClientSide-Ecommerce-API.postman_collection.json](postman/ClientSide-Ecommerce-API.postman_collection.json) into Postman.
2. Optional: import [postman/Local.postman_environment.json](postman/Local.postman_environment.json) and select environment **ClientSide Ecommerce — Local**.
3. Set `shopId` (shop UUID) and `email` / `password` to match your database.
4. Run **Health**, then **Auth → Register** or **Login**; successful responses save `accessToken` and `shopId` to collection variables for the **Catalog** requests.

## API

### Health

- `GET /health` — liveness

### Customer auth

Identity uses `users` (credentials), `customers` (profile, one per user), and `customer_shop_memberships` (shop scope). **Register** tokens include `shopId` in the JWT. **Login** tokens omit `shopId` in the JWT; the JSON body includes **`shopIds`** (active membership shop UUIDs only).

**Register** — `POST /api/auth/register` (201)

Body (shop UUID from your database):

```json
{
  "shopId": "00000000-0000-0000-0000-000000000000",
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
  "customer": { "id": "<uuid>" },
  "profile": [{ "name": "Alex", "shopName": "My Shop", "shopId": "<uuid>", "shopSlug": "my-shop" }]
}
```

If the email already exists, the same password must be supplied; the service either completes membership for this shop or returns `409` when already registered for that shop.

**Login** — `POST /api/auth/login`

```json
{
  "email": "buyer@example.com",
  "password": "secret12"
}
```

**200** — `{ accessToken, role, user, customer, shopIds, profile }` where `shopIds` lists active membership shop UUIDs (empty if none) and `profile` lists the same shops with `name` (`customers.display_name`), `shopName`, `shopId`, `shopSlug`. JWT has no `shopId` claim on login; use a value from `shopIds` for catalog query/header.

**Profile (authenticated)** — `GET /api/me/profile` and `PATCH /api/me/profile` with header `Authorization: Bearer <accessToken>`. Response includes `customer` (`id`, `displayName`) and `address` (normalized fields from `addresses`, or `null`). See [docs/client-storefront-api.md](../docs/client-storefront-api.md).

### Delivery service area (public)

- `POST /api/shops/:shopId/service-area/check` — body `{ "lat", "lng" }`; returns **`inServiceArea`**, **`distanceM`**, **`maxRadiusM`** vs shop address hub. Radius: **`SERVICE_AREA_RADIUS_METERS`** (default 5000). See [docs/client-storefront-api.md](../docs/client-storefront-api.md).

### Catalog (tenant-scoped)

- `GET /api/catalog/items?shopId=<uuid>` — active products for that shop (or header **`x-shop-id`**)

Default port: **4100** (see `.env.example`).

## Tests

HTTP tests use [Vitest](https://vitest.dev/) and [Supertest](https://github.com/ladjs/supertest) (no live server; `createServer()` only). They cover **health**, **auth/login/register validation**, **catalog `shopId` validation**, **oauth/jwt forbidden by default**, **unknown routes** (`ROUTE_NOT_FOUND`), and **malformed JSON** (`INVALID_JSON`). Profile tests skip JWT→DB session checks under **`NODE_ENV=test`**. They do **not** require PostgreSQL for most cases.

```bash
npm test
npm run test:watch
```
