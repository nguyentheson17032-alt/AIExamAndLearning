CREATE TABLE subjects (
    id          UUID         PRIMARY KEY,
    code        VARCHAR(32)  NOT NULL UNIQUE,
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE topics (
    id          UUID         PRIMARY KEY,
    subject_id  UUID         NOT NULL REFERENCES subjects (id),
    name        VARCHAR(120) NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_subject_id ON topics (subject_id);
CREATE UNIQUE INDEX uk_topics_subject_name ON topics (subject_id, name);
