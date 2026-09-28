package com.aiexam.learning.classroom.domain;

import com.aiexam.learning.classroom.api.AddStudentRequest;
import com.aiexam.learning.classroom.api.ClassroomCreateRequest;
import com.aiexam.learning.classroom.infrastructure.ClassroomMemberRepository;
import com.aiexam.learning.classroom.infrastructure.ClassroomPaperRepository;
import com.aiexam.learning.classroom.infrastructure.ClassroomRepository;
import com.aiexam.learning.common.exception.ConflictException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.paper.infrastructure.PaperSetRepository;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import com.aiexam.learning.user.infrastructure.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClassroomServiceTest {

    @Mock
    private ClassroomRepository classroomRepository;
    @Mock
    private ClassroomMemberRepository memberRepository;
    @Mock
    private ClassroomPaperRepository classroomPaperRepository;
    @Mock
    private PaperRepository paperRepository;
    @Mock
    private PaperSetRepository paperSetRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private ClassroomService classroomService;

    @Test
    void addStudent_whenDisplayNameMatchesTwoStudents_rejects() {
        User teacher = User.register("teacher@exam.local", "hash", "Teacher", UserRole.TEACHER, 1200);
        when(classroomRepository.findById(null)).thenReturn(Optional.of(Classroom.create(teacher, "10A1")));
        when(userRepository.findById(null)).thenReturn(Optional.of(teacher));
        when(userRepository.findByDisplayNameIgnoreCaseAndRoleAndEnabled("An", UserRole.STUDENT, true))
                .thenReturn(List.of(
                        User.register("an1@exam.local", "hash", "An", UserRole.STUDENT, 1000),
                        User.register("an2@exam.local", "hash", "An", UserRole.STUDENT, 1000)));

        assertThatThrownBy(() -> classroomService.addStudent(null, null, new AddStudentRequest(" An ")))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("An");
    }

    @Test
    void addStudent_whenDisplayNameMatchesNobody_rejects() {
        User teacher = User.register("teacher@exam.local", "hash", "Teacher", UserRole.TEACHER, 1200);
        when(classroomRepository.findById(null)).thenReturn(Optional.of(Classroom.create(teacher, "10A1")));
        when(userRepository.findById(null)).thenReturn(Optional.of(teacher));
        when(userRepository.findByDisplayNameIgnoreCaseAndRoleAndEnabled("Missing", UserRole.STUDENT, true))
                .thenReturn(List.of());

        assertThatThrownBy(() -> classroomService.addStudent(null, null, new AddStudentRequest("Missing")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rename_trimsAndStoresTheNewName() {
        User teacher = User.register("teacher@exam.local", "hash", "Teacher", UserRole.TEACHER, 1200);
        Classroom classroom = Classroom.create(teacher, "Lớp cũ");
        when(classroomRepository.findById(null)).thenReturn(Optional.of(classroom));
        when(userRepository.findById(null)).thenReturn(Optional.of(teacher));
        when(memberRepository.countByClassroom_Id(null)).thenReturn(2);

        var response = classroomService.rename(null, null, new ClassroomCreateRequest("  Lớp mới  "));

        assertThat(response.name()).isEqualTo("Lớp mới");
        assertThat(classroom.getName()).isEqualTo("Lớp mới");
    }

    @Test
    void uniqueStudent_whenOneMatch_returnsThatStudent() {
        User student = User.register("an@exam.local", "hash", "An", UserRole.STUDENT, 1000);

        assertThat(StudentNameMatch.uniqueStudent("An", List.of(student))).isSameAs(student);
    }
}
