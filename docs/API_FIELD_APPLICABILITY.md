# API Field Applicability Analysis

This document maps fields from `migrations/003_full_deployment_postgresql.sql` to current APIs and shows what is safe to expose now, what needs small API extensions, and what should stay internal.

## 1) Schema-to-Endpoint Applicability Matrix

| DB field(s) | API endpoint(s) | Applicability | Notes |
|---|---|---|---|
| `users.phone` | `POST /storefront/profile`, `GET /api/me/profile` | now | Already used for customer phone updates/view model. |
| `customers.display_name` | `POST /storefront/profile`, `GET/PATCH /api/me/profile` | now | Customer-visible profile name. |
| `customers.address_id`, `addresses.*` | `GET/POST/PATCH /storefront/address`, `GET/PATCH /api/me/profile` | now | Address payload maps to `addresses` table fields. |
| `orders.placed_at`, `orders.status`, totals, `currency` | `GET /storefront/orders`, `GET /storefront/orders/:id` | now | Timeline anchor is `placed_at`, step is `status`. |
| `order_items.*_snapshot`, `quantity`, `line_total_minor` | `GET /storefront/orders/:id` | now | Snapshot fields are safe for customer order detail. |
| `products.slug`, `availability`, `price_minor_per_unit` | `GET /storefront/products`, `GET /storefront/products/:slug` | now | Core storefront catalog fields. |
| `entity_images` + `media_assets`, `product_images` | `GET /storefront/categories`, `GET /storefront/products/:slug` | now | Image binding + gallery is API-safe. |
| `orders.picker_id`, `orders.picker_name` | `GET /shop/orders/queue`, `GET /storefront/orders/:id` | minimal extension | Useful for picker/customer context, not required now. |
| `products.offer_price_minor_per_unit` | `GET /storefront/products`, `GET /storefront/products/:slug` | minimal extension | Add for discount UI when business enables offer pricing. |
| `shops.public_id`, `shops.slug`, `shops.custom_domain` | public shop meta endpoint (new) | minimal extension | Good for storefront bootstrap metadata. |
| `shop_staff.display_name` | `POST /shop/auth/login` | minimal extension | Return picker display name in login/session response. |
| `outbox_messages.*` | none (internal) | internal only | For integrations/workers, not public response payload. |
| `media_assets.sha256`, `storage_key` | none (internal) | internal only | Storage internals; keep private. |
| soft-delete/admin fields (`is_deleted`, `deleted_at`, most `is_blocked`) | admin/internal only | internal only | Avoid exposing raw moderation/internal state in public APIs. |

## 2) Validation Alignment Checklist (DB -> API)

Use this checklist to keep request validation consistent with database constraints.

- **Orders status enum**
  - Keep API validation aligned with DB check:
    - `pending`, `accepted`, `picking`, `ready`, `out_for_delivery`, `delivered`, `cancelled`, `rejected`.
  - Apply in `PATCH /shop/orders/:id/status`.

- **Address coordinates**
  - Validate `lat` and `lng` ranges:
    - `lat` in `[-90, 90]`
    - `lng` in `[-180, 180]`
  - Enforce pair semantics (both present or both null) when patching profile/address.

- **Per-shop uniqueness-sensitive fields**
  - `products.slug` unique per shop.
  - `categories.slug` unique per shop.
  - `orders.order_number` unique per shop.
  - Convert DB unique violations into stable API errors (`CONFLICT`-style) when surfaced.

- **Shop staff role/status checks**
  - `shop_staff.role` is constrained (`owner`, `admin`, `manager`, `picker`).
  - Picker auth/session should explicitly enforce role and active/non-blocked state.

- **Domain/identity format constraints (when surfaced in APIs)**
  - If `custom_domain` or `public_id` is exposed/accepted later, mirror DB regex/length constraints in request validators.

## 3) Endpoint Delta Sheet (Safe Additions)

This is the implementation-ready delta sheet for small, backward-compatible API enhancements.

### `GET /storefront/products`
- **Request additions**: none required.
- **Response additions**:
  - optional `offer_price_minor_per_unit`.
- **Validation updates**:
  - none for request; ensure numeric serialization consistency in response.
- **Backward compatibility**:
  - additive field only; existing clients unaffected.

### `GET /storefront/products/:slug`
- **Request additions**: none required.
- **Response additions**:
  - optional `offer_price_minor_per_unit`.
  - keep `description` absent (not in schema).
- **Validation updates**:
  - none beyond existing slug param validation.
- **Backward compatibility**:
  - additive field only.

### `POST /shop/auth/login`
- **Request additions**: none required.
- **Response additions**:
  - optional `displayName` from `shop_staff.display_name`.
- **Validation updates**:
  - confirm role is `picker` and staff record is active/non-blocked/non-deleted.
- **Backward compatibility**:
  - additive response field only.

### `GET /shop/orders/queue`
- **Request additions**: none required.
- **Response additions**:
  - optional `picker_id`, `picker_name` if assigned.
- **Validation updates**:
  - keep picker JWT + tenant match middleware.
- **Backward compatibility**:
  - additive response fields only.

### `GET /storefront/orders/:id`
- **Request additions**: none required.
- **Response additions**:
  - optional `picker_name` for customer transparency (if business-approved).
- **Validation updates**:
  - none; continue customer+shop ownership checks.
- **Backward compatibility**:
  - additive response field only.

### Optional new endpoint: `GET /storefront/shop`
- **Request additions**:
  - none (use resolved tenant via middleware).
- **Response additions**:
  - `public_id`, `slug`, optional `custom_domain`, display-safe shop metadata.
- **Validation updates**:
  - none for body/query; require valid resolved `shopId`.
- **Backward compatibility**:
  - new endpoint; no breaking change.

## Suggested Implementation Files

- `src/interface/http/routes/index.js`
- `src/interface/http/controllers/storefrontCatalogController.js`
- `src/interface/http/controllers/storefrontOrdersController.js`
- `src/interface/http/controllers/shopPickerController.js`
- `src/interface/http/validations/storefrontCatalogSchemas.js`
- `src/interface/http/validations/storefrontRestSchemas.js`
- `docs/API.md`
