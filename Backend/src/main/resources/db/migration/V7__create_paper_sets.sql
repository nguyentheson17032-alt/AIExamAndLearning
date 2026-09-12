CREATE TABLE paper_sets (
    id             UUID         PRIMARY KEY,
    author_id      UUID         NOT NULL REFERENCES users (id),
    subject_id     UUID         NOT NULL REFERENCES subjects (id),
    title          VARCHAR(200) NOT NULL,
    academic_year  VARCHAR(32),
    description    TEXT,
    status         VARCHAR(32)  NOT NULL,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paper_sets_subject_id ON paper_sets (subject_id);
CREATE INDEX idx_paper_sets_status ON paper_sets (status);
CREATE UNIQUE INDEX uk_paper_sets_year_title ON paper_sets (academic_year, title);

ALTER TABLE papers
    ADD COLUMN paper_set_id UUID REFERENCES paper_sets (id),
    ADD COLUMN exam_number INTEGER;

CREATE INDEX idx_papers_paper_set_id ON papers (paper_set_id);
CREATE UNIQUE INDEX uk_papers_set_exam_number ON papers (paper_set_id, exam_number)
    WHERE paper_set_id IS NOT NULL;

ALTER TABLE paper_questions
    ADD COLUMN section_code VARCHAR(32),
    ADD COLUMN section_title VARCHAR(200),
    ADD COLUMN item_label VARCHAR(32),
    ADD COLUMN group_key VARCHAR(32);

CREATE INDEX idx_paper_questions_group_key ON paper_questions (paper_id, group_key);
