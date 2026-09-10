package com.aiexam.learning.ai.domain;

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
@Table(name = "ai_generation_jobs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AiGenerationJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiJobType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AiJobStatus status;

    @Column(name = "input_payload", nullable = false)
    private String inputPayload;

    @Column(name = "output_payload")
    private String outputPayload;

    @Column(name = "error_message")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    public static AiGenerationJob start(User requestedBy, AiJobType type, String inputPayload) {
        AiGenerationJob job = new AiGenerationJob();
        job.requestedBy = requestedBy;
        job.type = type;
        job.status = AiJobStatus.RUNNING;
        job.inputPayload = inputPayload;
        return job;
    }

    public void complete(String outputPayload) {
        this.status = AiJobStatus.COMPLETED;
        this.outputPayload = outputPayload;
        this.completedAt = Instant.now();
    }

    public void fail(String errorMessage) {
        this.status = AiJobStatus.FAILED;
        this.errorMessage = errorMessage;
        this.completedAt = Instant.now();
    }
}
