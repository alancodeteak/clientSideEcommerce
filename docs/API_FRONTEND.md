# Client storefront API — frontend integration guide

This document describes **every HTTP endpoint exposed by this service** in a consistent, frontend-friendly format (similar to a dashboard-style API spec).  

**Scope:** Customer storefront, catalog, auth, cart, checkout, and profile routes **only**. This service does **not** implement admin/superadmin APIs (for example there is no `GET /dashboard` or `superadmin_token` cookie here). If your product has a separate admin API, document it in that service’s repo.

**Complete coverage:** [§13 Complete route inventory](#13-complete-route-inventory-all-registered-routes) lists **every** `Method` + `Path` registered in `src/interface/http/routes/index.js`, cross-linked to the detailed section for each route.

**Base URL:** configure per environment (local default `http://localhost:4100`). There is **no** `/api/v1` prefix on this service; paths are as listed below.

**Swagger:** interactive docs at **`/api-docs`**, machine schema at **`/openapi.json`** (see `docs/API.md`).

**Format:** JSON request bodies and JSON responses unless noted. Send `Content-Type: application/json` for requests with a body.

### Per-endpoint specification pattern (required for frontend handoff)

Every operation below is written in the **same structure** as a typical dashboard-style internal API spec. **`§2` through `§12`** each use this pattern (adjusted when a response is not JSON, e.g. **302** redirects).

**Reference example** (illustrative — **not implemented** on this storefront service):

```text
2. Dashboard API (/api/v1/dashboard)
2.1. Get Dashboard Data
Endpoint: GET /dashboard
Description: Fetches and compiles data for the main dashboard view.
Authentication: superadmin_token cookie required.
Success Response (200 OK): { ... }
Error Response (401 Unauthorized / 500 Internal Server Error): Standard error format.
```

**How we map that here (Markdown):**

| Your field | In this document |
|------------|------------------|
| `2.x` title | `### X.Y Human-readable name` under a numbered `##` section |
| `Endpoint:` | **`Endpoint:`** `` `METHOD /path` `` |
| `Description:` | **`Description:`** … |
| `Authentication:` | **`Authentication:`** None \| Bearer JWT \| Cookie (as specified) |
| Extra (shop, rate limit, query, body) | **`Shop context:`**, **`Rate limiting:`**, **`Query parameters:`**, **`Request body:`** when relevant |
| `Success Response (200 OK):` | **`Success Response (200 OK):`** + fenced `json` (or **302** / **204** text where applicable) |
| `Error Response: …` | **`Error Response:`** table or bullets using the standard `{ "error": { "code", "message", "details?" } }` envelope (**§1.2**). |

---

## 1. Conventions (read first)

### 1.1 Standard success envelope

Most endpoints return a JSON object directly (not wrapped in `{ data: ... }`). Shapes are documented per endpoint.

### 1.2 Standard error envelope

Failures return:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable detail",
    "details": {}
  }
}
```

- `details` is present only for some validation errors (for example Zod `flatten()` output under `VALIDATION_ERROR`).
- `details` may be omitted when empty or not applicable.

### 1.3 Correlation: `x-request-id`

Every response includes an **`x-request-id`** header. If the client sends `x-request-id`, the server reuses it; otherwise it generates a UUID. Use this for support and log correlation.

### 1.4 Authentication: customer JWT

Protected routes require:

```http
Authorization: Bearer <accessToken>
```

JWT is issued by `POST /api/auth/otp/verify` (mobile OTP) or `POST /api/auth/oauth/jwt` (Google OAuth, see **§4**). Claims used by the server include at least `sub` (user id), `customerId`, optional `shopId` (when the user has exactly one active shop).

### 1.5 Shop / tenant resolution

Many routes need a **shop UUID**. The server resolves `req.shopId` (middleware) from, in order:

1. Header `x-shop-id` (UUID)
2. Hostname subdomain when `STOREFRONT_ROOT_DOMAIN` is set (slug → shop lookup)
3. Host header match against `shops.custom_domain` (skipped for `localhost`, `127.*`, bare IPs)

**Frontend guidance:** for API clients (Postman, SPA on another port), send **`x-shop-id: <shop-uuid>`** on tenant-scoped requests. Query `shopId` / `shop_id` is not read for catalog or storefront routes.

### 1.6 Cookies (browser flows)

| Cookie | Purpose |
|--------|---------|
| `storefront_oauth_exchange` | Set by Google OAuth callback; used to complete session via `POST /api/auth/oauth/jwt`. HttpOnly. |
| `storefront_serviceability` | Set by `POST /storefront/location/check` when location is checked. HttpOnly. |

### 1.7 CORS

Browser calls must use the configured `CORS_ORIGIN` and, for cookies, `fetch(..., { credentials: 'include' })` **same-site / correct origin** as allowed by the server.

### 1.8 Rate limiting

- **Auth / OAuth / location / checkout:** shared window (~15 minutes), see server config (returns **429** `TOO_MANY_REQUESTS`).
- **Cart mutations** (add/update/delete item): per-minute limit (**429**).

### 1.9 How IDs are passed (simple rules)

Use this checklist while integrating:

- **Shop ID (tenant):** send `x-shop-id: <shop-uuid>` header on tenant-scoped routes. Do not send shop id in query for catalog/storefront APIs.
- **Path IDs:** send resource ids in URL path only (`:slug`, `:itemId`, `:id`).
- **Body IDs:** send IDs in JSON only where request schema asks for them (for example `shopId` in OTP request/verify, `productId` in cart add, `addressId` in checkout).
- **Auth token:** protected routes require `Authorization: Bearer <accessToken>`.
- **Google OAuth cookie:** `POST /api/auth/oauth/jwt` requires `storefront_oauth_exchange` cookie set by callback.

### 1.10 Endpoint purpose quick map

| Endpoint group | Main purpose | Where IDs come from |
|---|---|---|
| `/api/auth/otp/*` | Phone OTP sign-in and JWT issue | `shopId` in body |
| `/api/oauth/*` | Start/complete Google OAuth | `x-shop-id` header or `additionalData.shopId` |
| `/api/me/profile` | Customer profile read/update | JWT + customer from token |
| `/storefront/*` | Customer storefront, cart, checkout, account, orders | Mostly `x-shop-id` + JWT for protected routes |
| `/api/catalog/*` | Tenant catalog listing/search | `x-shop-id` header |

---

## 2. Root & health

### 2.1 Get service info

**Endpoint:** `GET /`
**Description:** Small discovery payload with links to health and OAuth hint.
**Authentication:** None.

**Success Response (200 OK):**

```json
{
  "ok": true,
  "service": "clientside-ecommerce-api",
  "health": "/health",
  "openapi": "/openapi.json",
  "swaggerUi": "/api-docs"
}
```

**Error Response:** **500** `INTERNAL_ERROR` or unhandled error — standard JSON error envelope (**§1.2**).

---

### 2.2 Health check

**Endpoint:** `GET /health`
**Description:** Liveness probe.
**Authentication:** None.

**Success Response (200 OK):**

```json
{
  "status": "ok",
  "service": "clientside-ecommerce-api"
}
```

**Error Response:** **500** `INTERNAL_ERROR` — standard JSON error envelope (**§1.2**).

---

## 3. Authentication (Mobile OTP + Google OAuth)

This service does **not** expose email/password login. Customers can sign in either by **mobile OTP** (`/api/auth/otp/*`) or by **Google OAuth** (`§4`) then JWT exchange (`/api/auth/oauth/jwt`).

### 3.1 Request mobile OTP

**Endpoint:** `POST /api/auth/otp/request`
**Description:** Generates a one-time 6-digit OTP for `{ phone, shopId }`, stores only a hash, and sends the OTP through the local console SMS sender (dev/local). Response is intentionally generic.
**Authentication:** None.
**Rate limiting:** Yes.

**Request body:**

```json
{
  "phone": "+919999999999",
  "shopId": "uuid"
}
```

**Success Response (200 OK):**

```json
{
  "ok": true,
  "message": "If eligible, an OTP has been sent."
}
```

**Error Response:** **400** `VALIDATION_ERROR` (invalid phone/shop, resend-too-fast, request limit), **404** `NOT_FOUND` (shop not found), **429** `TOO_MANY_REQUESTS`. Standard JSON error envelope (**§1.2**).

---

### 3.2 Verify mobile OTP

**Endpoint:** `POST /api/auth/otp/verify`
**Description:** Verifies `{ phone, shopId, code }`, consumes challenge, ensures user/customer/membership, and returns the standard storefront JWT session payload.
**Authentication:** None.
**Rate limiting:** Yes.

**Request body:**

```json
{
  "phone": "+919999999999",
  "shopId": "uuid",
  "code": "123456"
}
```

**Success Response (200 OK):** Full session payload (`accessToken`, `user`, `customer`, `shopIds`, `profile`, …).

**Error Response:** **401** `UNAUTHORIZED` (invalid/expired OTP), **400** `VALIDATION_ERROR`, **404** `NOT_FOUND` (shop), **429** `TOO_MANY_REQUESTS`. Standard JSON error envelope (**§1.2**).

---

### 3.3 OAuth: exchange session for JWT

**Endpoint:** `POST /api/auth/oauth/jwt`
**Description:** After Google OAuth callback, completes session using `storefront_oauth_exchange` cookie.
**Authentication:** Cookie.
**Rate limiting:** Yes.

**Request body (strict JSON):**

```json
{}
```

Optional field:

```json
{
  "shopId": "uuid"
}
```

**Success Response (200 OK):** Full session payload (`accessToken`, `user`, `customer`, `shopIds`, `profile`, …).

**Error Response:**

| Status | Code | When |
|--------|------|------|
| 401 | `UNAUTHORIZED` | Missing/invalid OAuth cookie |
| 400 | `VALIDATION_ERROR` | Invalid body |

---

## 4. Google OAuth2 routes

**Registered redirect URI (Google Cloud):** `{API_PUBLIC_URL}/api/oauth/callback/google` (no trailing slash on `API_PUBLIC_URL`).

### 4.1 Start social sign-in

**Endpoint:** `POST /api/oauth/sign-in/social`

**Description:** Starts Google OAuth; either redirects the browser to Google or returns the authorize URL as JSON when `disableRedirect: true`.

**Authentication:** None.

**Rate limiting:** Yes.

**Request body (validated):**

```json
{
  "provider": "google",
  "disableRedirect": true,
  "callbackURL": "https://your-frontend/oauth-return",
  "additionalData": { "shopId": "optional-uuid" }
}
```

**Success Response (302 Found):** When `disableRedirect` is `false` or omitted — redirect to Google; **no JSON body**.

**Success Response (200 OK):** When `disableRedirect` is `true`:

```json
{
  "url": "https://accounts.google.com/..."
}
```

**Error Response:** **503** `SERVICE_UNAVAILABLE` if `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are not configured; **400** `VALIDATION_ERROR`; **429** `TOO_MANY_REQUESTS`. Standard JSON error envelope (**§1.2**).

### 4.2 Google callback

**Endpoint:** `GET /api/oauth/callback/google`
**Description:** Google redirect URI target. Exchanges `code` for user info, provisions/links customer, sets httpOnly `storefront_oauth_exchange`, then **302** redirects to `callbackURL` from OAuth state, or **`{API_PUBLIC_URL}/`** if none was set.
**Authentication:** None (browser + Google query params).
**Rate limiting:** Yes.

**Query parameters (from Google):** `code`, `state` (required on success path). On user denial, Google may send `error`, `error_description`.

**Success Response (302 Found):** Redirect to frontend `callbackURL` from OAuth state; if none was stored, default is `{API_PUBLIC_URL}/`. Sets `Set-Cookie: storefront_oauth_exchange=...` (httpOnly).

**Error Response:** **400** `VALIDATION_ERROR` (OAuth error query, missing code/state, email not verified); **401** `UNAUTHORIZED` (bad/expired `state`); **503** `SERVICE_UNAVAILABLE`; **429** `TOO_MANY_REQUESTS` — standard JSON error envelope (**§1.2**) when response is not a redirect.

---

## 5. Profile (`/api/me/*`)

### 5.1 Get profile

**Endpoint:** `GET /api/me/profile`
**Description:** Customer display name + linked address for the authenticated customer.
**Authentication:** Bearer JWT.

**Success Response (200 OK):**

```json
{
  "customer": {
    "id": "uuid",
    "displayName": "string or null"
  },
  "address": {
    "id": "uuid",
    "line1": "string",
    "line2": "string or null",
    "landmark": "string or null",
    "city": "string or null",
    "state": "string or null",
    "postalCode": "string or null",
    "country": "string or null",
    "lat": 12.34,
    "lng": 77.56,
    "raw": "string or null"
  }
}
```

`address` may be `null` if not set.

**Error Response:** **404** `NOT_FOUND`; **401** if blocked/invalid.

---

### 5.2 Patch profile

**Endpoint:** `PATCH /api/me/profile`
**Description:** Partial update. Returns same shape as GET.
**Authentication:** Bearer JWT.

**Request body (strict):**

```json
{
  "displayName": "optional string | null",
  "address": {
    "line1": "optional",
    "line2": "optional | null",
    "landmark": "optional | null",
    "city": "optional | null",
    "state": "optional | null",
    "postalCode": "optional | null",
    "country": "optional | null",
    "lat": "optional number | null",
    "lng": "optional number | null",
    "raw": "optional | null"
  }
}
```

Rules: if `address` is present it must not be `{}` (must include at least one field).

**Success Response (200 OK):** Same as GET profile.

**Error Response:** **400** `VALIDATION_ERROR`; **404** `NOT_FOUND`.

---

## 6. Storefront — location

### 6.1 Check service area

**Endpoint:** `POST /storefront/location/check`
**Description:** Computes whether `lat`/`lng` is within delivery radius from the shop hub; sets `storefront_serviceability` cookie.
**Authentication:** None.
**Shop context:** **Required** (query/header/host resolution).
**Rate limiting:** Yes.

**Request body:**

```json
{
  "lat": 12.9716,
  "lng": 77.5946
}
```

**Success Response (200 OK):**

```json
{
  "serviceable": true,
  "distanceM": 123,
  "maxRadiusM": 5000
}
```

`distanceM` / `maxRadiusM` may be `null` when not applicable (e.g. shop misconfiguration — align with server implementation).

**Error Response:** **400** `VALIDATION_ERROR`; **404** `NOT_FOUND` (shop); **429** `TOO_MANY_REQUESTS`. Standard JSON error envelope (**§1.2**).

---

## 7. Storefront — catalog (public)

Shop context **required** for these routes.

### 7.1 List categories

**Endpoint:** `GET /storefront/categories`

**Description:** Lists active categories for the resolved shop (optional parent filter). Includes category image metadata when present.

**Authentication:** None.

**Shop context:** Required (§1.5).

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `parent_id` | uuid optional | Parent category id |

**Success Response (200 OK):**

```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "parent_id": "uuid | null",
      "sort_order": 0,
      "image": {
        "mediaAssetId": "uuid",
        "storageKey": "string",
        "contentType": "string"
      }
    }
  ]
}
```

`image` may be `null`.

**Error Response:** **400** `VALIDATION_ERROR` (bad query); shop resolution errors — standard JSON error envelope (**§1.2**).

---

### 7.2 List products

**Endpoint:** `GET /storefront/products`

**Description:** Cursor-paginated product list for the shop with optional filters. Each product now includes:
- product image (`thumbnail`)
- category summary object (`parent_id`, `name`, `slug`)
- category image (`category.image`)

**Authentication:** None.

**Shop context:** Required (§1.5).

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `category_id` | uuid optional | Filter |
| `search` | string optional | Max 200 chars trimmed |
| `limit` | int optional | 1–100, default 24 |
| `cursor` | string optional | Pagination token from previous response |
| `availability` | enum optional | `in_stock` \| `out_of_stock` \| `unknown` |

**Success Response (200 OK):**

```json
{
  "products": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "price_minor_per_unit": "string",
      "offer_price_minor_per_unit": "string | null",
      "availability": "in_stock | ...",
      "unit": "string",
      "thumbnail": {
        "mediaAssetId": "uuid",
        "storageKey": "string",
        "contentType": "string"
      },
      "category": {
        "parent_id": "uuid | null",
        "name": "Vegetables",
        "slug": "vegetables",
        "image": {
          "mediaAssetId": "uuid",
          "storageKey": "string",
          "contentType": "string"
        }
      },
      "created_at": "timestamp",
      "category_id": "uuid | null"
    }
  ],
  "nextCursor": "base64url-string | null"
}
```

**Error Response:** **400** `VALIDATION_ERROR`; standard JSON error envelope (**§1.2**).

---

### 7.3 Get product by slug

**Endpoint:** `GET /storefront/products/:slug`

**Description:** Single product detail by URL slug, including gallery images.

**Authentication:** None.

**Shop context:** Required (§1.5).

**Path parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `slug` | string (1–128) | Product slug |

**Success Response (200 OK):**

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "unit": "string",
  "price_minor_per_unit": "string",
  "offer_price_minor_per_unit": "string | null",
  "availability": "string",
  "category_id": "uuid | null",
  "images": [
    {
      "mediaAssetId": "uuid",
      "sortOrder": 0,
      "storageKey": "string",
      "contentType": "string"
    }
  ]
}
```

**Error Response:** **404** `NOT_FOUND` when product is missing. **400** `VALIDATION_ERROR` (invalid slug). Standard JSON error envelope (**§1.2**).

---

## 8. Storefront — cart (authenticated)

All routes require **Bearer JWT** + **shop context**.

### 8.1 Create or get cart

**Endpoint:** `POST /storefront/cart`

**Description:** Ensures a cart exists for the authenticated customer in the resolved shop; returns cart and shop ids.

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Success Response (200 OK):**

```json
{
  "cartId": "uuid",
  "shopId": "uuid"
}
```

**Error Response:** **401** `UNAUTHORIZED`; **400** if `shopId` cannot be resolved. Standard JSON error envelope (**§1.2**).

---

### 8.2 Get cart with items

**Endpoint:** `GET /storefront/cart`

**Description:** Returns cart line items plus computed price summary (list + offer totals and discount).

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Success Response (200 OK):**

```json
{
  "cartId": "uuid",
  "items": [
    {
      "id": "uuid",
      "cart_id": "uuid",
      "product_id": "uuid",
      "title_snapshot": "string",
      "quantity": "string",
      "unit_label": "string",
      "unit_price_minor": "string",
      "is_custom": false,
      "custom_note": "string | null",
      "offer_price_minor_per_unit": "string | null"
    }
  ],
  "summary": {
    "total_price_minor": 0,
    "total_offer_price_minor": 0,
    "total_discount_minor": 0,
    "currency": "INR"
  }
}
```

**Note:** Adding the **same** `productId` again **merges** into one line (quantity increases).

**Error Response:** **401** `UNAUTHORIZED`; **400** shop resolution. Standard JSON error envelope (**§1.2**).

---

### 8.3 Add cart item

**Endpoint:** `POST /storefront/cart/items`

**Description:** Adds a line or increments quantity if the same product already exists in the cart.

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Rate limiting:** Yes (cart mutate).

**Request body:**

```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Success Response (201 Created):** New or updated cart line. Body is the inserted/updated row from the database (fields align with **§8.2** list items, typically `id`, `cart_id`, `product_id`, `title_snapshot`, `quantity`, `unit_label`, `unit_price_minor`, `is_custom`, `custom_note`).

**Error Response:** **404** `NOT_FOUND` (product); **429** `TOO_MANY_REQUESTS`. Standard JSON error envelope (**§1.2**).

---

### 8.4 Update cart item quantity

**Endpoint:** `PATCH /storefront/cart/items/:itemId`

**Description:** Updates quantity for one cart line belonging to the current cart.

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Rate limiting:** Yes.

**Path parameters:** `itemId` — UUID of `cart_items.id`.

**Request body:**

```json
{
  "quantity": 2
}
```

**Success Response (200 OK):**

```json
{
  "id": "uuid",
  "quantity": "string"
}
```

**Error Response:** **404** `NOT_FOUND` (item not in this cart); **400** `VALIDATION_ERROR`; **429** `TOO_MANY_REQUESTS`; **401** `UNAUTHORIZED`. Standard JSON error envelope (**§1.2**).

---

### 8.5 Remove cart item

**Endpoint:** `DELETE /storefront/cart/items/:itemId`

**Description:** Removes one line from the cart.

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Rate limiting:** Yes.

**Path parameters:** `itemId` — UUID of `cart_items.id`.

**Success Response (204 No Content):** Empty body.

**Error Response:** **404** `NOT_FOUND` (item not in this cart); **429** `TOO_MANY_REQUESTS`. Standard JSON error envelope (**§1.2**).

---

## 9. Storefront — checkout

### 9.1 Place order

**Endpoint:** `POST /storefront/checkout`

**Description:** Validates address, phone, serviceability, and stock; creates order in a transaction; clears cart; emits internal order notification hook.

**Authentication:** Bearer JWT.

**Shop context:** Required.

**Rate limiting:** Yes (auth + cart mutate).

**Optional middleware:** If `STOREFRONT_ENFORCE_SERVICEABILITY=true`, a valid `storefront_serviceability` cookie for the same shop is required (**403** `SERVICE_AREA`).

**Request body:**

```json
{
  "addressId": "uuid",
  "notes": "optional string | null"
}
```

**Business rules (summary):**

- Customer must have phone on user profile.
- `addressId` must match the customer’s **`customers.address_id`** linked address.
- Address must include `lat` / `lng`.
- Live distance check vs shop hub must be within `SERVICE_AREA_RADIUS_METERS`.
- Cart must be non-empty; all lines must reference **active** products **in_stock**.
- Success clears cart.

**Success Response (201 Created):**

```json
{
  "orderId": "uuid",
  "orderNumber": "ORD-...",
  "total_minor": 0
}
```

**Error Response (non-exhaustive; all use §1.2 envelope):**

| Status | `error.code` | Meaning |
|--------|--------------|---------|
| 400 | `PHONE_REQUIRED` | User phone missing |
| 400 | `ADDRESS_REQUIRED` | No linked address |
| 400 | `ADDRESS_INVALID` | `addressId` does not match linked address |
| 400 | `ADDRESS_COORDINATES_REQUIRED` | Missing lat/lng on stored address |
| 400 | `ADDRESS_COORDINATES_INVALID` | Stored coords invalid |
| 400 | `ADDRESS_NOT_SERVICEABLE` | Outside radius |
| 400 | `SHOP_UNAVAILABLE` | Shop not accepting customers |
| 400 | `SHOP_LOCATION_MISSING` | Shop hub coordinates missing |
| 400 | `PRODUCT_UNAVAILABLE` | Stock/status mismatch |
| 400 | `VALIDATION_ERROR` | Empty cart, access, etc. |
| 403 | `SERVICE_AREA` | Cookie enforcement failed |
| 404 | `NOT_FOUND` | Cart not found |
| 429 | `TOO_MANY_REQUESTS` | Rate limit |

---

## 10. Storefront — account (authenticated)

Shop context **required**; **Bearer JWT** required.

### 10.1 Update storefront profile (phone / display name)

**Endpoint:** `POST /storefront/profile`

**Description:** Updates `users.phone` and/or `customers.display_name` for storefront checkout readiness.

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Request body:** At least one of `displayName`, `phone`.

```json
{
  "displayName": "optional | null",
  "phone": "optional | null"
}
```

**Success Response (204 No Content):** Empty body.

**Error Response:** **400** `VALIDATION_ERROR`; **401** `UNAUTHORIZED`; **403** / access errors from shop membership checks — standard JSON error envelope (**§1.2**).

---

### 10.2 Get delivery address

**Endpoint:** `GET /storefront/address`

**Description:** Returns the customer’s linked delivery address for the shop context (same shape as **`address`** in **§5.1**).

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Success Response (200 OK):**

```json
{
  "address": {
    "id": "uuid",
    "line1": "string",
    "line2": "string | null",
    "landmark": "string | null",
    "city": "string | null",
    "state": "string | null",
    "postalCode": "string | null",
    "country": "string | null",
    "lat": 12.34,
    "lng": 77.56,
    "raw": "string | null"
  }
}
```

`address` may be `null` if not set.

**Error Response:** **401** `UNAUTHORIZED`; **400** / membership errors — standard JSON error envelope (**§1.2**).

---

### 10.3 Create / replace address via POST

**Endpoint:** `POST /storefront/address`

**Description:** Inserts or updates the linked `addresses` row and sets `customers.address_id` (full address payload).

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Request body:** Required fields per validation: `line1` (string); optional `line2`, `landmark`, `city`, `state`, `postalCode`, `country`, `lat`, `lng`, `raw`. **Recommend** `lat` / `lng` for checkout serviceability.

```json
{
  "line1": "string",
  "line2": "string | null",
  "landmark": "string | null",
  "city": "string | null",
  "state": "string | null",
  "postalCode": "string | null",
  "country": "string | null",
  "lat": 12.9716,
  "lng": 77.5946,
  "raw": "string | null"
}
```

**Success Response (204 No Content):** Empty body.

**Error Response:** **400** `VALIDATION_ERROR`; **401** `UNAUTHORIZED` — standard JSON error envelope (**§1.2**).

---

### 10.4 Patch address

**Endpoint:** `PATCH /storefront/address`

**Description:** Partial update of the linked address (same field names as **§10.3**; all optional in patch).

**Authentication:** Bearer JWT.

**Shop context:** Required (§1.5).

**Request body:** Any subset of address fields (validated partial schema).

**Success Response (204 No Content):** Empty body.

**Error Response:** **400** `VALIDATION_ERROR`; **401** `UNAUTHORIZED` — standard JSON error envelope (**§1.2**).

---

## 11. Storefront — orders (authenticated)

### 11.1 List orders

**Endpoint:** `GET /storefront/orders`

**Description:** Lists recent orders for the authenticated customer in the resolved shop (newest first, capped server-side).

**Authentication:** Bearer JWT.

**Shop context:** Required.

**Success Response (200 OK):**

```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "string",
      "status": "string",
      "total_minor": "string or number",
      "currency": "string",
      "placed_at": "timestamp",
      "picker_id": "uuid | null",
      "picker_name": "string | null"
    }
  ]
}
```

**Error Response:** **401** `UNAUTHORIZED`; **400** shop resolution — standard JSON error envelope (**§1.2**).

---

### 11.2 Order detail

**Endpoint:** `GET /storefront/orders/:id`

**Description:** Order header + line items for one order, if it belongs to this customer and shop.

**Authentication:** Bearer JWT.

**Shop context:** Required.

**Path parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `id` | uuid | Order id |

**Success Response (200 OK):**

```json
{
  "order": {
    "id": "uuid",
    "shop_id": "uuid",
    "customer_id": "string",
    "order_number": "string",
    "status": "string",
    "payment_method": "string",
    "subtotal_minor": "string",
    "delivery_fee_minor": "string",
    "total_minor": "string",
    "currency": "string",
    "notes": "string | null",
    "picker_id": "uuid | null",
    "picker_name": "string | null",
    "placed_at": "timestamp",
    "accepted_at": "timestamp | null",
    "out_for_delivery_at": "timestamp | null",
    "delivered_at": "timestamp | null",
    "rejected_at": "timestamp | null"
  },
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product_name_snapshot": "string",
      "unit_label_snapshot": "string",
      "quantity": "string",
      "unit_price_minor_snapshot": "string",
      "line_total_minor": "string",
      "is_custom": false,
      "custom_note": "string | null"
    }
  ]
}
```

**Error Response:** **404** `NOT_FOUND` if order missing or not owned by this customer/shop; **401** `UNAUTHORIZED`. Standard JSON error envelope (**§1.2**).

---

## 12. Catalog API (`/api/catalog/*`) — tenant-scoped

**Shop context:** send **`x-shop-id`** (UUID), or rely on host-based resolution (see **§1.5**). Catalog handlers use **`req.shopId`** set by the shop resolver (no query `shopId` / `shop_id`).

All routes below require a resolvable shop id; missing/invalid shop returns **400** validation-style errors from catalog services.

### 12.1 List categories

**Endpoint:** `GET /api/catalog/categories`

**Description:** Tenant-scoped category tree slice (internal catalog API; active categories only).

**Authentication:** None.

**Shop context:** Required — **`x-shop-id`** header or host resolution (§12 intro).

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `parentId` | uuid optional | When omitted, returns root categories (`parent_id IS NULL`). |

**Success Response (200 OK):**

```json
{
  "categories": [
    {
      "id": "uuid",
      "shop_id": "uuid",
      "parent_id": "uuid | null",
      "name": "string",
      "slug": "string",
      "sort_order": 0,
      "is_active": true,
      "metadata": {}
    }
  ]
}
```

`metadata` shape depends on DB JSON. Maximum **500** rows per response (server-side limit).

**Error Response:** **400** `VALIDATION_ERROR` (missing shop, bad `parentId`, etc.); standard JSON error envelope (**§1.2**).

---

### 12.2 List products

**Endpoint:** `GET /api/catalog/products`

**Description:** Lists active products for the tenant (optional category filter). Response includes product image and embedded category details with category image.

**Authentication:** None.

**Shop context:** Required — **`x-shop-id`** header or host resolution (§12 intro).

**Query:**

| Param | Type | Description |
|-------|------|-------------|
| `categoryId` | uuid optional | Filter by category. |

**Success Response (200 OK):**

```json
{
  "items": [
    {
      "id": "uuid",
      "shop_id": "uuid",
      "category_id": "uuid | null",
      "name": "string",
      "slug": "string",
      "base_unit": "string",
      "status": "active",
      "price_minor_per_unit": "string",
      "image": {
        "mediaAssetId": "uuid",
        "storageKey": "string",
        "contentType": "string"
      },
      "category": {
        "parent_id": "uuid | null",
        "name": "Vegetables",
        "slug": "vegetables",
        "image": {
          "mediaAssetId": "uuid",
          "storageKey": "string",
          "contentType": "string"
        }
      },
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

Only **active** products; maximum **100** rows; ordered by name ascending.

**Error Response:** **400** `VALIDATION_ERROR`; standard JSON error envelope (**§1.2**).

---

### 12.3 List items

**Endpoint:** `GET /api/catalog/items`

**Description:** Same handler and response shape as **§12.2** (`GET /api/catalog/products`) including product/category images.

**Authentication:** None.

**Shop context:** Required (§12 intro).

**Success Response (200 OK):** `{ "items": [ ... ] }` — same item object as §12.2.

**Error Response:** Same as **§12.2**.

---

### 12.4 Search

**Endpoint:** `GET /api/catalog/search`

**Description:** Unified product/category search with pagination and sort options. Product rows include product image plus category summary/image.

**Authentication:** None.

**Shop context:** Required (§12 intro).

**Query parameters:**

| Param | Type / default | Description |
|-------|----------------|-------------|
| *(tenant)* | Use header `x-shop-id` (or host-based resolution). Not a query parameter. |
| `type` | `both` (default) | `products` \| `categories` \| `both` — which arrays to fill. |
| `q` | string optional, max 200 | Search text (trimmed); `ILIKE` on name/slug. |
| `categoryId` | uuid optional | Filter **products** by category. |
| `parentId` | uuid optional | Filter **categories** by parent (`NULL` = root when omitted in SQL). |
| `availability` | enum optional | Products only: `in_stock` \| `out_of_stock` \| `unknown`. |
| `productSort` | default `name` | `name` \| `price` \| `created_at` \| `availability`. |
| `productOrder` | default `asc` | `asc` \| `desc`. |
| `categorySort` | default `sort_order` | `sort_order` \| `name` \| `created_at`. |
| `categoryOrder` | default `asc` | `asc` \| `desc`. |
| `productLimit` | int, default **100**, clamped 1–100 | Page size for products. |
| `productOffset` | int, default **0**, max **50000** | Product offset. |
| `categoryLimit` | int, default **500**, clamped 1–500 | Page size for categories. |
| `categoryOffset` | int, default **0**, max **50000** | Category offset. |

**Success Response (200 OK):**

```json
{
  "products": [
    {
      "id": "uuid",
      "shop_id": "uuid",
      "category_id": "uuid | null",
      "name": "string",
      "slug": "string",
      "base_unit": "string",
      "status": "active",
      "availability": "in_stock | out_of_stock | unknown",
      "price_minor_per_unit": "string",
      "image": {
        "mediaAssetId": "uuid",
        "storageKey": "string",
        "contentType": "string"
      },
      "category": {
        "parent_id": "uuid | null",
        "name": "Vegetables",
        "slug": "vegetables",
        "image": {
          "mediaAssetId": "uuid",
          "storageKey": "string",
          "contentType": "string"
        }
      },
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "categories": [
    {
      "id": "uuid",
      "shop_id": "uuid",
      "parent_id": "uuid | null",
      "name": "string",
      "slug": "string",
      "sort_order": 0,
      "is_active": true,
      "metadata": {}
    }
  ]
}
```

- When `type=products`, `categories` is `[]`.
- When `type=categories`, `products` is `[]`.
- When `type=both`, both arrays are populated.

**Error Response:** **400** `VALIDATION_ERROR` for bad query values — standard JSON error envelope (**§1.2**).

---

## 13. Complete route inventory (all registered routes)

Every row matches `src/interface/http/routes/index.js`. Use the **Doc §** column for request/response detail.

| Method | Path | Doc § | Auth | Rate limit |
|--------|------|-------|------|------------|
| GET | `/` | §2.1 | None | No |
| GET | `/health` | §2.2 | None | No |
| POST | `/api/auth/otp/request` | §3.1 | None | Yes |
| POST | `/api/auth/otp/verify` | §3.2 | None | Yes |
| POST | `/api/auth/oauth/jwt` | §3.3 | Cookie / optional body | Yes |
| POST | `/api/oauth/sign-in/social` | §4.1 | None | Yes |
| GET | `/api/oauth/callback/google` | §4.2 | None (browser) | Yes |
| GET | `/api/me/profile` | §5.1 | Bearer | No |
| PATCH | `/api/me/profile` | §5.2 | Bearer | No |
| POST | `/storefront/location/check` | §6.1 | None | Yes |
| GET | `/storefront/categories` | §7.1 | None | No |
| GET | `/storefront/products` | §7.2 | None | No |
| GET | `/storefront/products/:slug` | §7.3 | None | No |
| POST | `/storefront/cart` | §8.1 | Bearer | No |
| GET | `/storefront/cart` | §8.2 | Bearer | No |
| POST | `/storefront/cart/items` | §8.3 | Bearer | Yes (cart) |
| PATCH | `/storefront/cart/items/:itemId` | §8.4 | Bearer | Yes (cart) |
| DELETE | `/storefront/cart/items/:itemId` | §8.5 | Bearer | Yes (cart) |
| POST | `/storefront/checkout` | §9.1 | Bearer | Yes (auth + cart) |
| POST | `/storefront/profile` | §10.1 | Bearer | No |
| GET | `/storefront/address` | §10.2 | Bearer | No |
| POST | `/storefront/address` | §10.3 | Bearer | No |
| PATCH | `/storefront/address` | §10.4 | Bearer | No |
| GET | `/storefront/orders` | §11.1 | Bearer | No |
| GET | `/storefront/orders/:id` | §11.2 | Bearer | No |
| GET | `/api/catalog/categories` | §12.1 | None | No |
| GET | `/api/catalog/products` | §12.2 | None | No |
| GET | `/api/catalog/items` | §12.3 | None | No |
| GET | `/api/catalog/search` | §12.4 | None | No |

**Total: 33** route registrations (parameterized paths count as one row each).

---

## 14. Postman

Import: `postman/ClientSide-Ecommerce-API.postman_collection.json`.

---

## 15. Document maintenance

When you add or change routes in `src/interface/http/routes/index.js`, update this file in the same PR so the frontend team always has an accurate contract. **Update §13** first (inventory), then add or adjust the detailed section.
