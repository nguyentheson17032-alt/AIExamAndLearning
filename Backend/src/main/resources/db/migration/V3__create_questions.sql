CREATE TABLE questions (
    id                      UUID         PRIMARY KEY,
    author_id               UUID         NOT NULL REFERENCES users (id),
    subject_id              UUID         NOT NULL REFERENCES subjects (id),
    topic_id                UUID         REFERENCES topics (id),
    similar_to_question_id  UUID         REFERENCES questions (id),
    type                    VARCHAR(32)  NOT NULL,
    stem                    TEXT         NOT NULL,
    answer_key              TEXT,
    explanation             TEXT,
    difficulty              VARCHAR(32)  NOT NULL,
    elo_rating              INTEGER      NOT NULL,
    bloom_level             VARCHAR(32),
    source                  VARCHAR(32)  NOT NULL,
    status                  VARCHAR(32)  NOT NULL,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_subject_id ON questions (subject_id);
CREATE INDEX idx_questions_topic_id ON questions (topic_id);
CREATE INDEX idx_questions_author_id ON questions (author_id);
CREATE INDEX idx_questions_elo_rating ON questions (elo_rating);
CREATE INDEX idx_questions_status_source ON questions (status, source);

CREATE TABLE question_choices (
    id          UUID         PRIMARY KEY,
    question_id UUID         NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    label       VARCHAR(8)   NOT NULL,
    content     TEXT         NOT NULL,
    correct     BOOLEAN      NOT NULL,
    sort_order  INTEGER      NOT NULL
);

CREATE INDEX idx_question_choices_question_id ON question_choices (question_id);

CREATE TABLE question_classifications (
    id                    UUID          PRIMARY KEY,
    question_id           UUID          NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    tags                  TEXT,
    suggested_difficulty  VARCHAR(32),
    suggested_elo         INTEGER,
    category              VARCHAR(120),
    bloom_level           VARCHAR(32),
    confidence            NUMERIC(5, 4),
    model_name            VARCHAR(120)  NOT NULL,
    classified_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_question_classifications_question_id ON question_classifications (question_id);
