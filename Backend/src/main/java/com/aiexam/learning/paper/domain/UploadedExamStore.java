package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.paper.api.PaperSetItemResponse;
import com.aiexam.learning.paper.api.PaperSetResponse;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.paper.infrastructure.PaperSetRepository;
import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionImage;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.domain.QuestionType;
import com.aiexam.learning.question.infrastructure.QuestionImageRepository;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UploadedExamStore {

    private static final Pattern MARKER = Pattern.compile("\\[\\[img:([A-Za-z0-9._-]+)\\]\\]");

    private final QuestionRepository questionRepository;
    private final QuestionImageRepository questionImageRepository;
    private final PaperRepository paperRepository;
    private final PaperSetRepository paperSetRepository;

    @Transactional
    public PaperSetResponse persist(User author, Subject subject, String setTitle, Ts10ExamBank.Bank bank, Path imageDir) {
        if (bank.exams() == null || bank.exams().isEmpty()) {
            throw new BusinessRuleException("EMPTY_EXAM", "File không có câu hỏi theo dạng Phần I, II, III.");
        }
        PaperSet set = paperSetRepository.save(PaperSet.create(
                author,
                subject,
                setTitle,
                bank.academicYear(),
                bank.description() == null ? "Tải từ file Word" : bank.description(),
                ContentStatus.PUBLISHED
        ));
        Map<String, UUID> images = new HashMap<>();
        List<PaperSetItemResponse> papers = new ArrayList<>();
        boolean single = bank.exams().size() == 1;
        for (Ts10ExamBank.Exam exam : bank.exams()) {
            if (exam.questions() == null || exam.questions().isEmpty()) {
                continue;
            }
            String paperTitle = single ? setTitle : exam.title();
            Paper paper = Paper.create(
                    author,
                    subject,
                    paperTitle,
                    "Thang điểm 10: Phần I trắc nghiệm, Phần II đúng/sai, Phần III trả lời ngắn.",
                    PaperKind.EXAM,
                    PaperSource.MANUAL,
                    exam.durationMinutes() <= 0 ? 90 : exam.durationMinutes(),
                    800,
                    1600,
                    ContentStatus.PUBLISHED
            );
            paper.assignToSet(set, exam.number() <= 0 ? papers.size() + 1 : exam.number());
            int fallbackOrder = 1;
            for (Ts10ExamBank.Item item : exam.questions()) {
                if (item.section() == null || item.type() == null) {
                    continue;
                }
                Question question = Question.create(
                        author,
                        subject,
                        null,
                        item.type(),
                        stemOf(item),
                        item.answerKey(),
                        item.explanation(),
                        Difficulty.INTERMEDIATE,
                        PaperGenerateRules.questionElo(item.section()),
                        BloomLevel.APPLY,
                        QuestionSource.UPLOAD,
                        ContentStatus.PUBLISHED,
                        null
                );
                addChoices(question, item);
                question.attachImages(
                        loadImage(imageDir, set.getId(), filenameIn(item.stem()), images),
                        loadImage(imageDir, set.getId(), filenameIn(item.explanation()), images)
                );
                question = questionRepository.save(question);
                paper.addQuestion(
                        question,
                        item.sortOrder() > 0 ? item.sortOrder() : fallbackOrder,
                        pointsOf(item),
                        item.section(),
                        item.sectionTitle(),
                        item.itemLabel(),
                        item.groupKey()
                );
                fallbackOrder++;
            }
            if (paper.getItems().isEmpty()) {
                continue;
            }
            Paper saved = paperRepository.save(paper);
            papers.add(new PaperSetItemResponse(
                    saved.getId(),
                    saved.getExamNumber(),
                    saved.getTitle(),
                    saved.getDurationMinutes(),
                    saved.getItems().size()
            ));
        }
        if (papers.isEmpty()) {
            throw new BusinessRuleException("EMPTY_EXAM", "Không lưu được câu hỏi nào từ file Word.");
        }
        return PaperSetResponse.detail(set, papers);
    }

    private void addChoices(Question question, Ts10ExamBank.Item item) {
        if (item.choices() != null && !item.choices().isEmpty()) {
            int order = 1;
            for (Ts10ExamBank.Choice choice : item.choices()) {
                String label = choice.label() == null || choice.label().isBlank() ? String.valueOf(order) : choice.label();
                String content = choice.content() == null || choice.content().isBlank() ? label : choice.content();
                question.addChoice(label, content, choice.correct(), order++);
            }
            return;
        }
        if (item.type() == QuestionType.MULTIPLE_CHOICE) {
            String correct = item.answerKey() == null ? "A" : item.answerKey().trim();
            int order = 1;
            for (String label : List.of("A", "B", "C", "D")) {
                question.addChoice(label, label, label.equalsIgnoreCase(correct), order++);
            }
        } else if (item.type() == QuestionType.TRUE_FALSE) {
            boolean isTrue = item.answerKey() != null && item.answerKey().startsWith("Đ");
            question.addChoice("Đ", "Đúng", isTrue, 1);
            question.addChoice("S", "Sai", !isTrue, 2);
        }
    }

    private UUID loadImage(Path imageDir, UUID setId, String filename, Map<String, UUID> cache) {
        if (filename == null) {
            return null;
        }
        return cache.computeIfAbsent(filename, name -> saveImage(imageDir, setId, name));
    }

    private UUID saveImage(Path imageDir, UUID setId, String filename) {
        Path file = imageDir.resolve(filename).normalize();
        if (!file.startsWith(imageDir) || !Files.isRegularFile(file)) {
            return null;
        }
        try {
            byte[] bytes = Files.readAllBytes(file);
            String stored = "up-" + setId.toString().substring(0, 8) + "-" + filename;
            return questionImageRepository.save(QuestionImage.create(stored, "image/png", bytes)).getId();
        } catch (IOException ex) {
            return null;
        }
    }

    private static String stemOf(Ts10ExamBank.Item item) {
        if (item.stem() != null && !item.stem().isBlank()) {
            return item.stem();
        }
        return item.itemLabel() == null ? "Câu hỏi" : item.itemLabel();
    }

    private static BigDecimal pointsOf(Ts10ExamBank.Item item) {
        if (item.points() != null && item.points().signum() > 0) {
            return item.points();
        }
        return switch (item.section()) {
            case PART_I, PART_II -> new BigDecimal("0.25");
            case PART_III -> new BigDecimal("0.50");
        };
    }

    static String filenameIn(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        Matcher matcher = MARKER.matcher(text);
        return matcher.find() ? matcher.group(1) : null;
    }
}
