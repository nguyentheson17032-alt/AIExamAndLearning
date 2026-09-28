package com.aiexam.learning.classroom.domain;

import com.aiexam.learning.paper.domain.Paper;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "classroom_papers",
        uniqueConstraints = @UniqueConstraint(name = "uk_classroom_papers", columnNames = {"classroom_id", "paper_id"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ClassroomPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public static ClassroomPaper create(Classroom classroom, Paper paper) {
        ClassroomPaper link = new ClassroomPaper();
        link.classroom = classroom;
        link.paper = paper;
        return link;
    }
}
