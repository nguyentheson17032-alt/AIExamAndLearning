CREATE TABLE elo_events (
    id             UUID         PRIMARY KEY,
    user_id        UUID         NOT NULL REFERENCES users (id),
    attempt_id     UUID         REFERENCES attempts (id),
    question_id    UUID         REFERENCES questions (id),
    rating_before  INTEGER      NOT NULL,
    rating_after   INTEGER      NOT NULL,
    delta          INTEGER      NOT NULL,
    reason         VARCHAR(32)  NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_elo_events_user_id ON elo_events (user_id);
CREATE INDEX idx_elo_events_attempt_id ON elo_events (attempt_id);
CREATE INDEX idx_elo_events_created_at ON elo_events (created_at DESC);

CREATE TABLE ai_generation_jobs (
    id              UUID         PRIMARY KEY,
    requested_by    UUID         NOT NULL REFERENCES users (id),
    type            VARCHAR(32)  NOT NULL,
    status          VARCHAR(32)  NOT NULL,
    input_payload   TEXT         NOT NULL,
    output_payload  TEXT,
    error_message   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_ai_generation_jobs_requested_by ON ai_generation_jobs (requested_by);
CREATE INDEX idx_ai_generation_jobs_type_status ON ai_generation_jobs (type, status);
