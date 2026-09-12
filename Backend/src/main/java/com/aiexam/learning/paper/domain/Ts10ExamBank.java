package com.aiexam.learning.paper.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.aiexam.learning.question.domain.QuestionType;

import java.math.BigDecimal;
import java.util.List;

public final class Ts10ExamBank {

    private Ts10ExamBank() {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Bank(String title, String academicYear, String description, List<Exam> exams) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Exam(int number, String title, int durationMinutes, List<Item> questions) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(
            QuestionType type,
            PaperSection section,
            String sectionTitle,
            String itemLabel,
            String groupKey,
            String stem,
            List<Choice> choices,
            String answerKey,
            String explanation,
            BigDecimal points,
            int sortOrder
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(String label, String content, boolean correct) {}
}
