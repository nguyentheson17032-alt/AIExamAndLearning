package com.aiexam.learning.classroom.domain;

import com.aiexam.learning.attempt.domain.AttemptStatus;
import com.aiexam.learning.attempt.infrastructure.AttemptRepository;
import com.aiexam.learning.classroom.infrastructure.ClassroomPaperRepository;
import com.aiexam.learning.common.exception.ForbiddenException;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassroomAccess {

    private final ClassroomPaperRepository classroomPaperRepository;
    private final AttemptRepository attemptRepository;

    public void requireCanRead(User user, Paper paper) {
        if (!classroomPaperRepository.existsByPaper_Id(paper.getId())) {
            return;
        }
        if (canOpen(user, paper) || hasAttempt(user, paper)) {
            return;
        }
        throw denied();
    }

    public void requireCanStart(User user, Paper paper) {
        if (!classroomPaperRepository.existsByPaper_Id(paper.getId())) {
            return;
        }
        if (canOpen(user, paper)) {
            return;
        }
        if (attemptRepository.findByUserIdAndPaperIdAndStatus(user.getId(), paper.getId(), AttemptStatus.IN_PROGRESS)
                .isPresent()) {
            return;
        }
        throw denied();
    }

    private boolean canOpen(User user, Paper paper) {
        if (user.getRole() == UserRole.ADMIN || paper.getAuthor().getId().equals(user.getId())) {
            return true;
        }
        if (classroomPaperRepository.countTaughtBy(paper.getId(), user.getId()) > 0) {
            return true;
        }
        return paper.getStatus() == ContentStatus.PUBLISHED
                && classroomPaperRepository.countForStudent(paper.getId(), user.getId()) > 0;
    }

    private boolean hasAttempt(User user, Paper paper) {
        return attemptRepository.existsByUser_IdAndPaper_Id(user.getId(), paper.getId());
    }

    private ForbiddenException denied() {
        return new ForbiddenException("CLASSROOM_REQUIRED", "Join the class to open this paper");
    }
}
