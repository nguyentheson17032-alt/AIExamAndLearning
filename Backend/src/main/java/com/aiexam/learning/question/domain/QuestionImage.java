package com.aiexam.learning.question.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "question_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 160)
    private String filename;

    @Column(name = "content_type", nullable = false, length = 64)
    private String contentType;

    @Column(nullable = false)
    private byte[] bytes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public static QuestionImage create(String filename, String contentType, byte[] bytes) {
        QuestionImage image = new QuestionImage();
        image.filename = filename;
        image.contentType = contentType;
        image.bytes = bytes.clone();
        return image;
    }
}
