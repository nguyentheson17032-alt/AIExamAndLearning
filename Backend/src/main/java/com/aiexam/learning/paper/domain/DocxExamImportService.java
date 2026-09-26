package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.CatalogService;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.api.PaperSetItemResponse;
import com.aiexam.learning.paper.api.PaperSetResponse;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.paper.infrastructure.PaperSetRepository;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.domain.QuestionType;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ooxml.POIXMLException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocxExamImportService {

    private final CatalogService catalogService;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final PaperRepository paperRepository;
    private final PaperSetRepository paperSetRepository;

    @Transactional
    public PaperSetResponse importDocx(
            UUID authorId,
            UUID subjectId,
            String title,
            String filename,
            InputStream docx
    ) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + authorId));
        Subject subject = catalogService.getSubject(subjectId);
        List<String> stems = readStems(docx);
        if (stems.isEmpty()) {
            throw new BusinessRuleException("EMPTY_EXAM", "File không có nội dung đề.");
        }

        String setTitle = titleOf(title, filename);
        PaperSet set = paperSetRepository.save(PaperSet.create(
                author,
                subject,
                setTitle,
                null,
                "Tải từ file Word",
                ContentStatus.PUBLISHED
        ));

        List<BigDecimal> points = pointsFor(stems.size());
        Paper paper = Paper.create(
                author,
                subject,
                setTitle,
                "Tải từ file Word",
                PaperKind.EXAM,
                PaperSource.MANUAL,
                90,
                800,
                1600,
                ContentStatus.PUBLISHED
        );
        paper.assignToSet(set, 1);
        for (int i = 0; i < stems.size(); i++) {
            Question question = questionRepository.save(Question.create(
                    author,
                    subject,
                    null,
                    QuestionType.SHORT_ANSWER,
                    stems.get(i),
                    null,
                    null,
                    Difficulty.INTERMEDIATE,
                    1000,
                    null,
                    QuestionSource.UPLOAD,
                    ContentStatus.PUBLISHED,
                    null
            ));
            paper.addQuestion(question, i + 1, points.get(i));
        }
        Paper saved = paperRepository.save(paper);
        return PaperSetResponse.detail(set, List.of(new PaperSetItemResponse(
                saved.getId(),
                saved.getExamNumber(),
                saved.getTitle(),
                saved.getDurationMinutes(),
                saved.getItems().size()
        )));
    }

    private static List<String> readStems(InputStream docx) {
        try {
            return DocxParagraphReader.questions(DocxParagraphReader.paragraphs(docx));
        } catch (IOException | POIXMLException ex) {
            throw new BusinessRuleException("INVALID_DOCX", "Không đọc được file Word.");
        }
    }

    static String titleOf(String requested, String filename) {
        String raw = requested == null || requested.isBlank() ? filename : requested;
        if (raw == null) {
            raw = "";
        }
        int slash = Math.max(raw.lastIndexOf('/'), raw.lastIndexOf('\\'));
        if (slash >= 0) {
            raw = raw.substring(slash + 1);
        }
        raw = raw.replaceAll("(?i)\\.docx$", "").trim();
        if (raw.isBlank()) {
            raw = "Đề đã tải";
        }
        return raw.length() > 200 ? raw.substring(0, 200) : raw;
    }

    static List<BigDecimal> pointsFor(int count) {
        BigDecimal total = new BigDecimal("10.00");
        BigDecimal share = total.divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN);
        List<BigDecimal> points = new ArrayList<>(count);
        BigDecimal assigned = BigDecimal.ZERO;
        for (int i = 0; i < count; i++) {
            BigDecimal piece = i == count - 1 ? total.subtract(assigned) : share;
            points.add(piece);
            assigned = assigned.add(piece);
        }
        return points;
    }
}
