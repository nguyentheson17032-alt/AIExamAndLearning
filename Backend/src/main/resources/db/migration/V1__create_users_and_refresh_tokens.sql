CREATE TABLE users (
    id            UUID         PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(120) NOT NULL,
    role          VARCHAR(32)  NOT NULL,
    elo_rating    INTEGER      NOT NULL DEFAULT 1000,
    rank_code     VARCHAR(32)  NOT NULL,
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_elo_rating ON users (elo_rating);

CREATE TABLE refresh_tokens (
    id             UUID         PRIMARY KEY,
    user_id        UUID         NOT NULL REFERENCES users (id),
    token_hash     VARCHAR(64)  NOT NULL UNIQUE,
    family_id      UUID         NOT NULL,
    expires_at     TIMESTAMPTZ  NOT NULL,
    revoked_at     TIMESTAMPTZ,
    replaced_by_id UUID,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_family_id ON refresh_tokens (family_id);
