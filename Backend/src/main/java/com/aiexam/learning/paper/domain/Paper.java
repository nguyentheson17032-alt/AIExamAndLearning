package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Question;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "papers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Paper {

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

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaperKind kind;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaperSource source;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    @Column(name = "target_elo_min", nullable = false)
    private int targetEloMin;

    @Column(name = "target_elo_max", nullable = false)
    private int targetEloMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentStatus status;

    @OneToMany(mappedBy = "paper", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<PaperQuestion> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public static Paper create(
            User author,
            Subject subject,
            String title,
            String description,
            PaperKind kind,
            PaperSource source,
            int durationMinutes,
            int targetEloMin,
            int targetEloMax,
            ContentStatus status
    ) {
        Paper paper = new Paper();
        paper.author = author;
        paper.subject = subject;
        paper.title = title;
        paper.description = description;
        paper.kind = kind;
        paper.source = source;
        paper.durationMinutes = durationMinutes;
        paper.targetEloMin = targetEloMin;
        paper.targetEloMax = targetEloMax;
        paper.status = status;
        return paper;
    }

    public void addQuestion(Question question, int sortOrder, BigDecimal points) {
        items.add(PaperQuestion.create(this, question, sortOrder, points));
    }

    public void updateDetails(
            String title,
            String description,
            int durationMinutes,
            int targetEloMin,
            int targetEloMax,
            ContentStatus status
    ) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.targetEloMin = targetEloMin;
        this.targetEloMax = targetEloMax;
        this.status = status;
    }

    public BigDecimal maxScore() {
        return items.stream()
                .map(PaperQuestion::getPoints)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
