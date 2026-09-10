package com.aiexam.learning.question.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "question_choices")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionChoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 8)
    private String label;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private boolean correct;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    public static QuestionChoice create(Question question, String label, String content, boolean correct, int sortOrder) {
        QuestionChoice choice = new QuestionChoice();
        choice.question = question;
        choice.label = label;
        choice.content = content;
        choice.correct = correct;
        choice.sortOrder = sortOrder;
        return choice;
    }

    void attach(Question question) {
        this.question = question;
    }
}
