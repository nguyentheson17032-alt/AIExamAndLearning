package com.aiexam.learning.attempt.domain;

import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionChoice;
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
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "attempts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttemptStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "graded_at")
    private Instant gradedAt;

    @Column(precision = 8, scale = 2)
    private BigDecimal score;

    @Column(name = "max_score", precision = 8, scale = 2)
    private BigDecimal maxScore;

    @Column(name = "elo_before")
    private Integer eloBefore;

    @Column(name = "elo_after")
    private Integer eloAfter;

    @Column(name = "elo_delta")
    private Integer eloDelta;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttemptAnswer> answers = new ArrayList<>();

    public static Attempt start(User user, Paper paper) {
        Attempt attempt = new Attempt();
        attempt.user = user;
        attempt.paper = paper;
        attempt.status = AttemptStatus.IN_PROGRESS;
        attempt.startedAt = Instant.now();
        attempt.maxScore = paper.maxScore();
        return attempt;
    }

    public AttemptAnswer addAnswer(Question question, QuestionChoice selectedChoice, String textAnswer) {
        AttemptAnswer answer = AttemptAnswer.create(this, question, selectedChoice, textAnswer);
        answers.add(answer);
        return answer;
    }

    public void markSubmitted() {
        this.status = AttemptStatus.SUBMITTED;
        this.submittedAt = Instant.now();
    }

    public void markGraded(BigDecimal score, int eloBefore, int eloAfter) {
        this.status = AttemptStatus.GRADED;
        this.gradedAt = Instant.now();
        this.score = score;
        this.eloBefore = eloBefore;
        this.eloAfter = eloAfter;
        this.eloDelta = eloAfter - eloBefore;
    }
}
