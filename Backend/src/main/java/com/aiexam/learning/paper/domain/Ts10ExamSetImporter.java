package com.aiexam.learning.paper.domain;

import com.aiexam.learning.attempt.infrastructure.AttemptRepository;
import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.infrastructure.SubjectRepository;
import com.aiexam.learning.elo.infrastructure.EloEventRepository;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.paper.infrastructure.PaperSetRepository;
import com.aiexam.learning.question.domain.BloomLevel;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import com.aiexam.learning.user.infrastructure.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class Ts10ExamSetImporter {

    static final String RESOURCE = "data/ts10-2025-2026.json";

    private final ObjectMapper objectMapper;
    private final PaperSetRepository paperSetRepository;
    private final PaperRepository paperRepository;
    private final QuestionRepository questionRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AttemptRepository attemptRepository;
    private final EloEventRepository eloEventRepository;

    @Transactional
    public PaperSet importIfAbsent() {
        Ts10ExamBank.Bank bank = readBank();
        return paperSetRepository.findByAcademicYearAndTitle(bank.academicYear(), bank.title())
                .map(existing -> stale(existing) ? replace(existing, bank) : existing)
                .orElseGet(() -> importBank(bank));
    }

    private boolean stale(PaperSet set) {
        List<Paper> papers = paperRepository.findByPaperSetIdOrderByExamNumberAsc(set.getId());
        if (papers.isEmpty() || papers.getFirst().getItems().isEmpty()) {
            return true;
        }
        String stem = papers.getFirst().getItems().getFirst().getQuestion().getStem();
        String explanation = papers.getFirst().getItems().getFirst().getQuestion().getExplanation();
        return stem == null || !stem.contains("[[img:/ts10/q/")
                || stem.contains("/ts10/image")
                || explanation == null || !explanation.contains("-sol-");
    }

    private PaperSet replace(PaperSet existing, Ts10ExamBank.Bank bank) {
        List<Paper> papers = paperRepository.findByPaperSetIdOrderByExamNumberAsc(existing.getId());
        List<UUID> paperIds = papers.stream().map(Paper::getId).toList();
        List<UUID> questionIds = papers.stream()
                .flatMap(paper -> paper.getItems().stream())
                .map(item -> item.getQuestion().getId())
                .distinct()
                .toList();
        if (!paperIds.isEmpty()) {
            List<UUID> attemptIds = attemptRepository.findByPaper_IdIn(paperIds).stream()
                    .map(attempt -> attempt.getId())
                    .toList();
            if (!attemptIds.isEmpty()) {
                eloEventRepository.deleteByAttempt_IdIn(attemptIds);
            }
            attemptRepository.deleteByPaper_IdIn(paperIds);
            paperRepository.deleteAll(papers);
        }
        if (!questionIds.isEmpty()) {
            eloEventRepository.deleteByQuestion_IdIn(questionIds);
            questionRepository.deleteAllById(questionIds);
        }
        paperSetRepository.delete(existing);
        paperSetRepository.flush();
        log.info("Replaced stale TS10 exam set {}", existing.getTitle());
        return importBank(bank);
    }

    private PaperSet importBank(Ts10ExamBank.Bank bank) {
        User author = teacher();
        Subject math = math();
        PaperSet set = paperSetRepository.save(PaperSet.create(
                author,
                math,
                bank.title(),
                bank.academicYear(),
                bank.description(),
                ContentStatus.PUBLISHED
        ));
        for (Ts10ExamBank.Exam exam : bank.exams()) {
            Paper paper = Paper.create(
                    author,
                    math,
                    exam.title(),
                    "Đề Toán tuyển sinh 10 năm học " + bank.academicYear() + " · thang điểm 10",
                    PaperKind.EXAM,
                    PaperSource.MANUAL,
                    exam.durationMinutes() <= 0 ? 90 : exam.durationMinutes(),
                    1000,
                    1400,
                    ContentStatus.PUBLISHED
            );
            paper.assignToSet(set, exam.number());
            List<Ts10ExamBank.Item> items = exam.questions();
            for (int i = 0; i < items.size(); i++) {
                Ts10ExamBank.Item item = items.get(i);
                Question question = Question.create(
                        author,
                        math,
                        null,
                        item.type(),
                        blankToPlaceholder(item.stem(), item.itemLabel()),
                        item.answerKey(),
                        item.explanation(),
                        Difficulty.INTERMEDIATE,
                        1200,
                        BloomLevel.APPLY,
                        QuestionSource.UPLOAD,
                        ContentStatus.PUBLISHED,
                        null
                );
                if (item.choices() != null) {
                    int order = 1;
                    for (Ts10ExamBank.Choice choice : item.choices()) {
                        question.addChoice(choice.label(), choice.content(), choice.correct(), order++);
                    }
                }
                question = questionRepository.save(question);
                paper.addQuestion(
                        question,
                        item.sortOrder() > 0 ? item.sortOrder() : i + 1,
                        item.points(),
                        item.section(),
                        item.sectionTitle(),
                        item.itemLabel(),
                        item.groupKey()
                );
            }
            paperRepository.save(paper);
        }
        log.info("Imported TS10 exam set {} with {} papers", bank.title(), bank.exams().size());
        return set;
    }

    private Ts10ExamBank.Bank readBank() {
        try (InputStream in = new ClassPathResource(RESOURCE).getInputStream()) {
            return objectMapper.readValue(in, Ts10ExamBank.Bank.class);
        } catch (Exception ex) {
            throw new IllegalStateException("Cannot read " + RESOURCE, ex);
        }
    }

    private User teacher() {
        return userRepository.findByEmail("teacher@exam.local")
                .orElseGet(() -> userRepository.save(User.register(
                        "teacher@exam.local",
                        passwordEncoder.encode("Teacher123!"),
                        "Teacher",
                        UserRole.TEACHER,
                        1200
                )));
    }

    private Subject math() {
        return subjectRepository.findByCode("MATH")
                .orElseGet(() -> subjectRepository.save(Subject.create(
                        "MATH", "Toán", "Toán tuyển sinh 10")));
    }

    private String blankToPlaceholder(String stem, String label) {
        if (stem == null || stem.isBlank()) {
            return "Câu " + label;
        }
        return stem;
    }
}
