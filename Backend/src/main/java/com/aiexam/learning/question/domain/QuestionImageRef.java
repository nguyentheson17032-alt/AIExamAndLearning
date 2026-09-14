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
@Table(name = "question_image_refs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuestionImageRef {

    static final String STEM = "STEM";
    static final String EXPLANATION = "EXPLANATION";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 16)
    private String role;

    @Column(name = "image_id", nullable = false)
    private UUID imageId;

    static QuestionImageRef create(Question question, String role, UUID imageId) {
        QuestionImageRef ref = new QuestionImageRef();
        ref.question = question;
        ref.role = role;
        ref.imageId = imageId;
        return ref;
    }
}
