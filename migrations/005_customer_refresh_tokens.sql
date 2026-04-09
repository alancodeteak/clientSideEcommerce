CREATE TABLE IF NOT EXISTS customer_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  jwt_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  replaced_by_token_hash TEXT,
  issued_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_refresh_tokens_user_id
  ON customer_refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_customer_refresh_tokens_customer_id
  ON customer_refresh_tokens(customer_id);

CREATE INDEX IF NOT EXISTS idx_customer_refresh_tokens_expires_at
  ON customer_refresh_tokens(expires_at);
