CREATE TABLE classrooms (
    id          UUID         PRIMARY KEY,
    teacher_id  UUID         NOT NULL REFERENCES users (id),
    name        VARCHAR(120) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classrooms_teacher_id ON classrooms (teacher_id);

CREATE TABLE classroom_members (
    id            UUID        PRIMARY KEY,
    classroom_id  UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    student_id    UUID        NOT NULL REFERENCES users (id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_classroom_members UNIQUE (classroom_id, student_id)
);

CREATE INDEX idx_classroom_members_student_id ON classroom_members (student_id);

CREATE TABLE classroom_papers (
    id            UUID        PRIMARY KEY,
    classroom_id  UUID        NOT NULL REFERENCES classrooms (id) ON DELETE CASCADE,
    paper_id      UUID        NOT NULL REFERENCES papers (id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_classroom_papers UNIQUE (classroom_id, paper_id)
);

CREATE INDEX idx_classroom_papers_paper_id ON classroom_papers (paper_id);
