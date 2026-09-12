package com.aiexam.learning.paper.domain;

import com.aiexam.learning.question.domain.Question;
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
import java.util.UUID;

@Entity
@Table(name = "paper_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaperQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal points;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_code")
    private PaperSection section;

    @Column(name = "section_title")
    private String sectionTitle;

    @Column(name = "item_label")
    private String itemLabel;

    @Column(name = "group_key")
    private String groupKey;

    public static PaperQuestion create(Paper paper, Question question, int sortOrder, BigDecimal points) {
        return create(paper, question, sortOrder, points, null, null, null, null);
    }

    public static PaperQuestion create(
            Paper paper,
            Question question,
            int sortOrder,
            BigDecimal points,
            PaperSection section,
            String sectionTitle,
            String itemLabel,
            String groupKey
    ) {
        PaperQuestion item = new PaperQuestion();
        item.paper = paper;
        item.question = question;
        item.sortOrder = sortOrder;
        item.points = points;
        item.section = section;
        item.sectionTitle = sectionTitle;
        item.itemLabel = itemLabel;
        item.groupKey = groupKey;
        return item;
    }

    void attach(Paper paper) {
        this.paper = paper;
    }
}
