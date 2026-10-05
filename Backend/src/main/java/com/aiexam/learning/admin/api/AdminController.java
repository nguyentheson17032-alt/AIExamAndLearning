package com.aiexam.learning.admin.api;

import com.aiexam.learning.attempt.domain.Attempt;
import com.aiexam.learning.attempt.infrastructure.AttemptRepository;
import com.aiexam.learning.classroom.domain.Classroom;
import com.aiexam.learning.classroom.infrastructure.ClassroomMemberRepository;
import com.aiexam.learning.classroom.infrastructure.ClassroomPaperRepository;
import com.aiexam.learning.classroom.infrastructure.ClassroomRepository;
import com.aiexam.learning.elo.domain.EloEvent;
import com.aiexam.learning.elo.infrastructure.EloEventRepository;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperSource;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.question.infrastructure.QuestionRepository;
import com.aiexam.learning.user.domain.RankCode;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import com.aiexam.learning.user.infrastructure.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final ClassroomMemberRepository memberRepository;
    private final ClassroomPaperRepository classroomPaperRepository;
    private final PaperRepository paperRepository;
    private final QuestionRepository questionRepository;
    private final AttemptRepository attemptRepository;
    private final EloEventRepository eloEventRepository;

    @GetMapping("/stats")
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long totalTeachers = userRepository.countByRole(UserRole.TEACHER);
        long totalClassrooms = classroomRepository.count();
        long totalQuestions = questionRepository.count();
        long totalPapers = paperRepository.count();
        long totalAiExams = paperRepository.countBySource(PaperSource.AI_GENERATED);
        long totalAttempts = attemptRepository.count();

        List<User> students = userRepository.findByRole(UserRole.STUDENT);
        Map<String, Long> rankDist = new EnumMap<>(RankCode.class).entrySet().stream()
                .collect(Collectors.toMap(e -> e.getKey().name(), e -> 0L));

        for (RankCode code : RankCode.values()) {
            rankDist.put(code.name(), 0L);
        }
        for (User s : students) {
            RankCode rank = s.getRankCode();
            if (rank != null) {
                rankDist.put(rank.name(), rankDist.getOrDefault(rank.name(), 0L) + 1);
            }
        }

        return new AdminStatsResponse(
                totalStudents,
                totalTeachers,
                totalClassrooms,
                totalQuestions,
                totalPapers,
                totalAiExams,
                totalAttempts,
                rankDist
        );
    }

    @GetMapping("/students")
    @Transactional(readOnly = true)
    public List<AdminStudentResponse> getStudents(@RequestParam(required = false) String query) {
        List<User> students = userRepository.findByRoleOrderByCreatedAtDesc(UserRole.STUDENT);
        return students.stream()
                .filter(u -> query == null || query.isBlank()
                        || u.getDisplayName().toLowerCase().contains(query.toLowerCase())
                        || u.getEmail().toLowerCase().contains(query.toLowerCase()))
                .map(u -> new AdminStudentResponse(
                        u.getId(),
                        u.getEmail(),
                        u.getDisplayName(),
                        u.getRole(),
                        u.getEloRating(),
                        u.getRankCode(),
                        u.isEnabled(),
                        u.getCreatedAt(),
                        attemptRepository.countByUser_Id(u.getId())
                ))
                .toList();
    }

    @GetMapping("/students/{id}/details")
    @Transactional(readOnly = true)
    public ResponseEntity<AdminStudentDetailResponse> getStudentDetails(@PathVariable UUID id) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null || u.getRole() != UserRole.STUDENT) {
            return ResponseEntity.notFound().build();
        }

        List<Attempt> attempts = attemptRepository.findByUser_IdOrderByStartedAtDesc(id);
        List<AdminStudentDetailResponse.StudentAttemptSummary> attemptSummaries = attempts.stream()
                .map(a -> new AdminStudentDetailResponse.StudentAttemptSummary(
                        a.getId(),
                        a.getPaper().getId(),
                        a.getPaper().getTitle(),
                        a.getPaper().getSubject() != null ? a.getPaper().getSubject().getName() : "Chung",
                        a.getScore(),
                        a.getMaxScore(),
                        a.getEloBefore(),
                        a.getEloAfter(),
                        a.getEloDelta(),
                        a.getStatus(),
                        a.getStartedAt(),
                        a.getSubmittedAt(),
                        a.getGradedAt()
                ))
                .toList();

        List<EloEvent> eloEvents = eloEventRepository.findByUser_IdOrderByCreatedAtDesc(id);
        List<AdminStudentDetailResponse.StudentEloHistorySummary> eloSummaries = eloEvents.stream()
                .map(e -> new AdminStudentDetailResponse.StudentEloHistorySummary(
                        e.getId(),
                        e.getRatingBefore(),
                        e.getRatingAfter(),
                        e.getDelta(),
                        e.getReason(),
                        e.getCreatedAt(),
                        e.getAttempt() != null ? e.getAttempt().getId() : null,
                        e.getAttempt() != null && e.getAttempt().getPaper() != null ? e.getAttempt().getPaper().getTitle() : null
                ))
                .toList();

        return ResponseEntity.ok(new AdminStudentDetailResponse(
                u.getId(),
                u.getEmail(),
                u.getDisplayName(),
                u.getRole(),
                u.getEloRating(),
                u.getRankCode(),
                u.isEnabled(),
                u.getCreatedAt(),
                attempts.size(),
                attemptSummaries,
                eloSummaries
        ));
    }

    @GetMapping("/teachers")
    @Transactional(readOnly = true)
    public List<AdminTeacherResponse> getTeachers(@RequestParam(required = false) String query) {
        List<User> teachers = userRepository.findByRoleOrderByCreatedAtDesc(UserRole.TEACHER);
        return teachers.stream()
                .filter(u -> query == null || query.isBlank()
                        || u.getDisplayName().toLowerCase().contains(query.toLowerCase())
                        || u.getEmail().toLowerCase().contains(query.toLowerCase()))
                .map(u -> new AdminTeacherResponse(
                        u.getId(),
                        u.getEmail(),
                        u.getDisplayName(),
                        u.getRole(),
                        u.isEnabled(),
                        u.getCreatedAt(),
                        classroomRepository.countByTeacher_Id(u.getId()),
                        paperRepository.countByAuthor_Id(u.getId())
                ))
                .toList();
    }

    @GetMapping("/classrooms")
    @Transactional(readOnly = true)
    public List<AdminClassroomResponse> getClassrooms() {
        List<Classroom> classrooms = classroomRepository.findAllByOrderByCreatedAtDesc();
        return classrooms.stream()
                .map(c -> new AdminClassroomResponse(
                        c.getId(),
                        c.getName(),
                        c.getTeacher().getId(),
                        c.getTeacher().getDisplayName(),
                        memberRepository.countByClassroom_Id(c.getId()),
                        classroomPaperRepository.countByClassroom_Id(c.getId()),
                        c.getCreatedAt()
                ))
                .toList();
    }

    @GetMapping("/classrooms/{id}/details")
    @Transactional(readOnly = true)
    public ResponseEntity<AdminClassroomDetailResponse> getClassroomDetails(@PathVariable UUID id) {
        Classroom classroom = classroomRepository.findById(id).orElse(null);
        if (classroom == null) {
            return ResponseEntity.notFound().build();
        }

        var memberEntities = memberRepository.findByClassroom_IdOrderByCreatedAtAsc(id);
        var members = memberEntities.stream()
                .map(m -> new AdminClassroomDetailResponse.ClassMemberSummary(
                        m.getStudent().getId(),
                        m.getStudent().getDisplayName(),
                        m.getStudent().getEmail(),
                        m.getStudent().getEloRating(),
                        m.getStudent().getRankCode(),
                        m.getCreatedAt()
                ))
                .toList();

        var paperEntities = classroomPaperRepository.findByClassroomIdWithPaper(id);
        var papers = paperEntities.stream()
                .map(cp -> new AdminClassroomDetailResponse.ClassPaperSummary(
                        cp.getPaper().getId(),
                        cp.getPaper().getTitle(),
                        cp.getPaper().getSubject() != null ? cp.getPaper().getSubject().getName() : "Chung",
                        cp.getPaper().getDurationMinutes(),
                        cp.getPaper().getItems() != null ? cp.getPaper().getItems().size() : 0,
                        cp.getPaper().getStatus(),
                        cp.getCreatedAt()
                ))
                .toList();

        return ResponseEntity.ok(new AdminClassroomDetailResponse(
                classroom.getId(),
                classroom.getName(),
                classroom.getTeacher().getId(),
                classroom.getTeacher().getDisplayName(),
                classroom.getCreatedAt(),
                members,
                papers
        ));
    }

    @GetMapping("/ai-exams")
    @Transactional(readOnly = true)
    public List<AdminAiExamResponse> getAiExams() {
        List<Paper> papers = paperRepository.findBySourceOrderByCreatedAtDesc(PaperSource.AI_GENERATED);
        return papers.stream()
                .map(p -> new AdminAiExamResponse(
                        p.getId(),
                        p.getTitle(),
                        p.getSubject() != null ? p.getSubject().getId() : null,
                        p.getSubject() != null ? p.getSubject().getName() : "Chung",
                        p.getKind(),
                        p.getSource(),
                        p.getDurationMinutes(),
                        p.getTargetEloMin(),
                        p.getTargetEloMax(),
                        p.getItems() != null ? p.getItems().size() : 0,
                        p.getStatus(),
                        p.getCreatedAt(),
                        p.getAuthor() != null ? p.getAuthor().getDisplayName() : "AI System"
                ))
                .toList();
    }

    @PutMapping("/papers/{id}/status")
    @Transactional
    public ResponseEntity<Void> updatePaperStatus(@PathVariable UUID id, @Valid @RequestBody UpdatePaperStatusRequest request) {
        Paper paper = paperRepository.findById(id).orElse(null);
        if (paper == null) {
            return ResponseEntity.notFound().build();
        }
        paper.setStatus(request.status());
        paperRepository.save(paper);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/status")
    @Transactional
    public ResponseEntity<Void> updateUserStatus(@PathVariable UUID id, @RequestBody UpdateUserStatusRequest request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.setEnabled(request.enabled());
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/elo")
    @Transactional
    public ResponseEntity<Void> updateUserElo(@PathVariable UUID id, @Valid @RequestBody UpdateUserEloRequest request) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        user.applyElo(request.eloRating());
        userRepository.save(user);
        return ResponseEntity.noContent().build();
    }
}
