package com.aiexam.learning.paper.domain;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.infrastructure.SubjectRepository;
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

    @Transactional
    public PaperSet importIfAbsent() {
        Ts10ExamBank.Bank bank = readBank();
        return paperSetRepository.findByAcademicYearAndTitle(bank.academicYear(), bank.title())
                .orElseGet(() -> importBank(bank));
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
