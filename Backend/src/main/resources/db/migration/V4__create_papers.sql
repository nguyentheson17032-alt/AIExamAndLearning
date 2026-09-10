CREATE TABLE papers (
    id                UUID         PRIMARY KEY,
    author_id         UUID         NOT NULL REFERENCES users (id),
    subject_id        UUID         NOT NULL REFERENCES subjects (id),
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    kind              VARCHAR(32)  NOT NULL,
    source            VARCHAR(32)  NOT NULL,
    duration_minutes  INTEGER      NOT NULL,
    target_elo_min    INTEGER      NOT NULL,
    target_elo_max    INTEGER      NOT NULL,
    status            VARCHAR(32)  NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_papers_subject_id ON papers (subject_id);
CREATE INDEX idx_papers_author_id ON papers (author_id);
CREATE INDEX idx_papers_kind_status ON papers (kind, status);
CREATE INDEX idx_papers_target_elo ON papers (target_elo_min, target_elo_max);

CREATE TABLE paper_questions (
    id          UUID          PRIMARY KEY,
    paper_id    UUID          NOT NULL REFERENCES papers (id) ON DELETE CASCADE,
    question_id UUID          NOT NULL REFERENCES questions (id),
    sort_order  INTEGER       NOT NULL,
    points      NUMERIC(8, 2) NOT NULL,
    CONSTRAINT uk_paper_questions UNIQUE (paper_id, question_id)
);

CREATE INDEX idx_paper_questions_paper_id ON paper_questions (paper_id);
CREATE INDEX idx_paper_questions_question_id ON paper_questions (question_id);
