package com.aiexam.learning.common;

import com.aiexam.learning.catalog.domain.Subject;
import com.aiexam.learning.catalog.infrastructure.SubjectRepository;
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
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevDataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final QuestionRepository questionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() > 0) {
            return;
        }
        User teacher = userRepository.save(User.register(
                "teacher@exam.local", passwordEncoder.encode("Teacher123!"), "Teacher", UserRole.TEACHER, 1200));
        userRepository.save(User.register(
                "student@exam.local", passwordEncoder.encode("Student123!"), "Student", UserRole.STUDENT, 1000));
        Subject math = subjectRepository.save(Subject.create("MATH", "Toán", "Kho câu hỏi toán"));
        Question q1 = Question.create(
                teacher, math, null, QuestionType.MULTIPLE_CHOICE,
                "2 + 2 = ?", "4", "Cộng số tự nhiên", Difficulty.BEGINNER, 900, null,
                QuestionSource.MANUAL, ContentStatus.PUBLISHED, null);
        q1.addChoice("A", "3", false, 1);
        q1.addChoice("B", "4", true, 2);
        q1.addChoice("C", "5", false, 3);
        Question q2 = Question.create(
                teacher, math, null, QuestionType.SHORT_ANSWER,
                "Căn bậc hai của 9?", "3", "3 * 3 = 9", Difficulty.BEGINNER, 950, null,
                QuestionSource.MANUAL, ContentStatus.PUBLISHED, null);
        questionRepository.save(q1);
        questionRepository.save(q2);
    }
}
