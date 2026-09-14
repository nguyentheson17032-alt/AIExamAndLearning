CREATE TABLE question_images (
    id            UUID         PRIMARY KEY,
    filename      VARCHAR(160) NOT NULL UNIQUE,
    content_type  VARCHAR(64)  NOT NULL,
    bytes         BYTEA        NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE question_image_refs (
    id          UUID        PRIMARY KEY,
    question_id UUID        NOT NULL REFERENCES questions (id) ON DELETE CASCADE,
    role        VARCHAR(16) NOT NULL,
    image_id    UUID        NOT NULL REFERENCES question_images (id),
    UNIQUE (question_id, role)
);

CREATE INDEX idx_question_image_refs_image_id ON question_image_refs (image_id);
