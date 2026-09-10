package com.aiexam.learning.question.domain;

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
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "question_classifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionClassification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(name = "suggested_difficulty")
    private Difficulty suggestedDifficulty;

    @Column(name = "suggested_elo")
    private Integer suggestedElo;

    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "bloom_level")
    private BloomLevel bloomLevel;

    private BigDecimal confidence;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "classified_at", nullable = false)
    private Instant classifiedAt;

    public static QuestionClassification create(
            Question question,
            String tags,
            Difficulty suggestedDifficulty,
            Integer suggestedElo,
            String category,
            BloomLevel bloomLevel,
            BigDecimal confidence,
            String modelName
    ) {
        QuestionClassification classification = new QuestionClassification();
        classification.question = question;
        classification.tags = tags;
        classification.suggestedDifficulty = suggestedDifficulty;
        classification.suggestedElo = suggestedElo;
        classification.category = category;
        classification.bloomLevel = bloomLevel;
        classification.confidence = confidence;
        classification.modelName = modelName;
        classification.classifiedAt = Instant.now();
        return classification;
    }
}
