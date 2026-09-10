package com.aiexam.learning.question.domain;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.domain.Topic;
import com.aiexam.learning.user.domain.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "similar_to_question_id")
    private Question similarTo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(nullable = false)
    private String stem;

    @Column(name = "answer_key")
    private String answerKey;

    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(name = "elo_rating", nullable = false)
    private int eloRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "bloom_level")
    private BloomLevel bloomLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionSource source;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentStatus status;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<QuestionChoice> choices = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public static Question create(
            User author,
            Subject subject,
            Topic topic,
            QuestionType type,
            String stem,
            String answerKey,
            String explanation,
            Difficulty difficulty,
            int eloRating,
            BloomLevel bloomLevel,
            QuestionSource source,
            ContentStatus status,
            Question similarTo
    ) {
        Question question = new Question();
        question.author = author;
        question.subject = subject;
        question.topic = topic;
        question.type = type;
        question.stem = stem;
        question.answerKey = answerKey;
        question.explanation = explanation;
        question.difficulty = difficulty;
        question.eloRating = eloRating;
        question.bloomLevel = bloomLevel;
        question.source = source;
        question.status = status;
        question.similarTo = similarTo;
        return question;
    }

    public void addChoice(String label, String content, boolean correct, int sortOrder) {
        QuestionChoice choice = QuestionChoice.create(this, label, content, correct, sortOrder);
        choices.add(choice);
    }

    public void replaceChoices(List<QuestionChoice> newChoices) {
        choices.clear();
        for (QuestionChoice choice : newChoices) {
            choice.attach(this);
            choices.add(choice);
        }
    }

    public void updateContent(
            String stem,
            String answerKey,
            String explanation,
            Difficulty difficulty,
            int eloRating,
            BloomLevel bloomLevel,
            ContentStatus status
    ) {
        this.stem = stem;
        this.answerKey = answerKey;
        this.explanation = explanation;
        this.difficulty = difficulty;
        this.eloRating = eloRating;
        this.bloomLevel = bloomLevel;
        this.status = status;
    }

    public void applyClassification(Difficulty difficulty, int eloRating, BloomLevel bloomLevel) {
        this.difficulty = difficulty;
        this.eloRating = eloRating;
        this.bloomLevel = bloomLevel;
    }

    public void archive() {
        this.status = ContentStatus.ARCHIVED;
    }

    public boolean isObjective() {
        return type == QuestionType.MULTIPLE_CHOICE || type == QuestionType.TRUE_FALSE;
    }
}
