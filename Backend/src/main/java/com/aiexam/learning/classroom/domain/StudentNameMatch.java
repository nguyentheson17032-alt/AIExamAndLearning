package com.aiexam.learning.classroom.domain;

import com.aiexam.learning.common.exception.ConflictException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.user.domain.User;

import java.util.List;

public final class StudentNameMatch {

    private StudentNameMatch() {}

    public static User uniqueStudent(String displayName, List<User> matches) {
        if (matches.isEmpty()) {
            throw new ResourceNotFoundException(
                    "STUDENT_NOT_FOUND",
                    "No student named " + displayName);
        }
        if (matches.size() > 1) {
            throw new ConflictException(
                    "STUDENT_NAME_AMBIGUOUS",
                    "More than one student is named " + displayName);
        }
        return matches.get(0);
    }
}
