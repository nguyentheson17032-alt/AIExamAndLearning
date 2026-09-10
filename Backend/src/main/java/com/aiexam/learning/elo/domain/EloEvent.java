package com.aiexam.learning.elo.domain;

import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.user.domain.User;
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
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "elo_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EloEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id")
    private Attempt attempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    private Question question;

    @Column(name = "rating_before", nullable = false)
    private int ratingBefore;

    @Column(name = "rating_after", nullable = false)
    private int ratingAfter;

    @Column(nullable = false)
    private int delta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EloReason reason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public static EloEvent record(
            User user,
            Attempt attempt,
            Question question,
            int ratingBefore,
            int ratingAfter,
            EloReason reason
    ) {
        EloEvent event = new EloEvent();
        event.user = user;
        event.attempt = attempt;
        event.question = question;
        event.ratingBefore = ratingBefore;
        event.ratingAfter = ratingAfter;
        event.delta = ratingAfter - ratingBefore;
        event.reason = reason;
        return event;
    }
}
