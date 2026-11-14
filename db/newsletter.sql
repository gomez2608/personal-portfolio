CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email          text PRIMARY KEY,
  status         text NOT NULL CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  source         text NOT NULL,
  consent_at     timestamptz NOT NULL,
  policy_version text NOT NULL,
  ip_hash        text NOT NULL,
  last_link_at   timestamptz NOT NULL,
  confirmed_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_sends (
  issue        integer PRIMARY KEY,
  status       text NOT NULL CHECK (status IN ('sending', 'sent')),
  broadcast_id text,
  claimed_at   timestamptz NOT NULL DEFAULT now(),
  sent_at      timestamptz
);
