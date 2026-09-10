CREATE TABLE attempts (
    id            UUID          PRIMARY KEY,
    user_id       UUID          NOT NULL REFERENCES users (id),
    paper_id      UUID          NOT NULL REFERENCES papers (id),
    status        VARCHAR(32)   NOT NULL,
    started_at    TIMESTAMPTZ   NOT NULL,
    submitted_at  TIMESTAMPTZ,
    graded_at     TIMESTAMPTZ,
    score         NUMERIC(8, 2),
    max_score     NUMERIC(8, 2),
    elo_before    INTEGER,
    elo_after     INTEGER,
    elo_delta     INTEGER
);

CREATE INDEX idx_attempts_user_id ON attempts (user_id);
CREATE INDEX idx_attempts_paper_id ON attempts (paper_id);
CREATE INDEX idx_attempts_status ON attempts (status);

CREATE TABLE attempt_answers (
    id                  UUID          PRIMARY KEY,
    attempt_id          UUID          NOT NULL REFERENCES attempts (id) ON DELETE CASCADE,
    question_id         UUID          NOT NULL REFERENCES questions (id),
    selected_choice_id  UUID          REFERENCES question_choices (id),
    text_answer         TEXT,
    correct             BOOLEAN,
    score               NUMERIC(8, 2),
    ai_feedback         TEXT,
    graded_by           VARCHAR(32),
    CONSTRAINT uk_attempt_answers UNIQUE (attempt_id, question_id)
);

CREATE INDEX idx_attempt_answers_attempt_id ON attempt_answers (attempt_id);
CREATE INDEX idx_attempt_answers_question_id ON attempt_answers (question_id);
