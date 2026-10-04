package com.aiexam.learning.common;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.infrastructure.SubjectRepository;
import com.aiexam.learning.common.config.SeedProperties;
import com.aiexam.learning.paper.domain.Ts10ExamSetImporter;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.question.domain.Difficulty;
import com.aiexam.learning.question.domain.Question;
import com.aiexam.learning.question.domain.QuestionSource;
import com.aiexam.learning.question.domain.QuestionType;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DevDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;
    private final Ts10ExamSetImporter ts10ExamSetImporter;
    private final SeedProperties seedProperties;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("teacher@exam.local").isEmpty()) {
            userRepository.save(User.register(
                    "teacher@exam.local", passwordEncoder.encode("Teacher123!"), "Teacher", UserRole.TEACHER, 1200));
        }
        if (userRepository.findByEmail("student@exam.local").isEmpty()) {
            userRepository.save(User.register(
                    "student@exam.local", passwordEncoder.encode("Student123!"), "Student", UserRole.STUDENT, 1000));
        }
        if (!Boolean.TRUE.equals(seedProperties.enabled())) {
            return;
        }
        if (Boolean.TRUE.equals(seedProperties.ts10ExamSet())) {
            ts10ExamSetImporter.importIfAbsent();
        }
    }
}

