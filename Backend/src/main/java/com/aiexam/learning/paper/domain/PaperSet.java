package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.question.domain.ContentStatus;
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
@Table(name = "paper_sets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaperSet {

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

    @Column(name = "academic_year")
    private String academicYear;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContentStatus status;

    @OneToMany(mappedBy = "paperSet")
    @OrderBy("examNumber ASC")
    private List<Paper> papers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public static PaperSet create(
            User author,
            Subject subject,
            String title,
            String academicYear,
            String description,
            ContentStatus status
    ) {
        PaperSet set = new PaperSet();
        set.author = author;
        set.subject = subject;
        set.title = title;
        set.academicYear = academicYear;
        set.description = description;
        set.status = status;
        return set;
    }
}
