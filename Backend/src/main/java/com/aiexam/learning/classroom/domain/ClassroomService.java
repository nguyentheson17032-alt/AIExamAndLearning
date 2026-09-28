package com.aiexam.learning.classroom.domain;

import com.aiexam.learning.classroom.api.AddStudentRequest;
import com.aiexam.learning.classroom.api.ClassPaperResponse;
import com.aiexam.learning.classroom.api.ClassroomCreateRequest;
import com.aiexam.learning.classroom.api.ClassroomDetailResponse;
import com.aiexam.learning.classroom.api.ClassroomMemberResponse;
import com.aiexam.learning.classroom.api.ClassroomResponse;
import com.aiexam.learning.classroom.api.ShareOptionsResponse;
import com.aiexam.learning.classroom.api.SharePaperSetOption;
import com.aiexam.learning.classroom.api.SharePapersRequest;
import com.aiexam.learning.classroom.api.SharePapersResponse;
import com.aiexam.learning.classroom.infrastructure.ClassroomMemberRepository;
import com.aiexam.learning.classroom.infrastructure.ClassroomPaperRepository;
import com.aiexam.learning.classroom.infrastructure.ClassroomRepository;
import com.aiexam.learning.common.exception.ConflictException;
import com.aiexam.learning.common.exception.ForbiddenException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import com.aiexam.learning.paper.domain.Paper;
import com.aiexam.learning.paper.domain.PaperSet;
import com.aiexam.learning.paper.infrastructure.PaperRepository;
import com.aiexam.learning.paper.infrastructure.PaperSetRepository;
import com.aiexam.learning.question.domain.ContentStatus;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import com.aiexam.learning.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final ClassroomMemberRepository memberRepository;
    private final ClassroomPaperRepository classroomPaperRepository;
    private final PaperRepository paperRepository;
    private final PaperSetRepository paperSetRepository;
    private final UserRepository userRepository;

    @Transactional
    public ClassroomResponse create(UUID teacherId, ClassroomCreateRequest request) {
        User teacher = user(teacherId);
        if (teacher.getRole() == UserRole.STUDENT) {
            throw new ForbiddenException("CLASSROOM_FORBIDDEN", "Only a teacher can create a class");
        }
        Classroom saved = classroomRepository.save(Classroom.create(teacher, request.name()));
        return ClassroomResponse.from(saved, 0);
    }

    @Transactional
    public ClassroomResponse rename(UUID teacherId, UUID classroomId, ClassroomCreateRequest request) {
        Classroom classroom = requireTeacherOf(teacherId, classroomId);
        classroom.rename(request.name());
        return ClassroomResponse.from(classroom, memberRepository.countByClassroom_Id(classroomId));
    }

    public List<ClassroomResponse> list(User viewer) {
        if (viewer.getRole() == UserRole.STUDENT) {
            return memberRepository.findByStudent_IdOrderByCreatedAtDesc(viewer.getId()).stream()
                    .map(member -> ClassroomResponse.from(
                            member.getClassroom(),
                            memberRepository.countByClassroom_Id(member.getClassroom().getId())))
                    .toList();
        }
        return classroomRepository.findByTeacher_IdOrderByCreatedAtDesc(viewer.getId()).stream()
                .map(classroom -> ClassroomResponse.from(
                        classroom,
                        memberRepository.countByClassroom_Id(classroom.getId())))
                .toList();
    }

    public ClassroomDetailResponse get(User viewer, UUID classroomId) {
        Classroom classroom = classroom(classroomId);
        boolean teaches = teaches(viewer, classroom);
        boolean member = memberRepository.existsByClassroom_IdAndStudent_Id(classroomId, viewer.getId());
        if (!teaches && !member) {
            throw new ForbiddenException("CLASSROOM_FORBIDDEN", "You are not in this class");
        }
        List<ClassroomMemberResponse> members = memberRepository.findByClassroom_IdOrderByCreatedAtAsc(classroomId)
                .stream()
                .map(ClassroomMemberResponse::from)
                .toList();
        List<ClassPaperResponse> papers = classroomPaperRepository.findByClassroomIdWithPaper(classroomId).stream()
                .map(link -> link.getPaper())
                .filter(paper -> teaches || paper.getStatus() == ContentStatus.PUBLISHED)
                .map(ClassPaperResponse::from)
                .toList();
        return new ClassroomDetailResponse(
                classroom.getId(),
                classroom.getName(),
                classroom.getTeacher().getId(),
                classroom.getTeacher().getDisplayName(),
                teaches,
                members,
                papers
        );
    }

    @Transactional
    public ClassroomMemberResponse addStudent(UUID teacherId, UUID classroomId, AddStudentRequest request) {
        Classroom classroom = requireTeacherOf(teacherId, classroomId);
        String name = request.displayName().trim();
        User student = StudentNameMatch.uniqueStudent(
                name,
                userRepository.findByDisplayNameIgnoreCaseAndRoleAndEnabled(name, UserRole.STUDENT, true));
        if (memberRepository.existsByClassroom_IdAndStudent_Id(classroom.getId(), student.getId())) {
            throw new ConflictException("ALREADY_IN_CLASS", "That student is already in the class");
        }
        return ClassroomMemberResponse.from(memberRepository.save(ClassroomMember.create(classroom, student)));
    }

    @Transactional
    public void removeStudent(UUID teacherId, UUID classroomId, UUID studentId) {
        requireTeacherOf(teacherId, classroomId);
        if (!memberRepository.existsByClassroom_IdAndStudent_Id(classroomId, studentId)) {
            throw new ResourceNotFoundException("STUDENT_NOT_IN_CLASS", "That student is not in the class");
        }
        memberRepository.deleteByClassroom_IdAndStudent_Id(classroomId, studentId);
    }

    public ShareOptionsResponse available(User viewer, UUID classroomId) {
        Classroom classroom = requireTeacherOf(viewer.getId(), classroomId);
        Set<UUID> linked = new HashSet<>(classroomPaperRepository.findPaperIdsByClassroomId(classroomId));
        UUID teacherId = classroom.getTeacher().getId();
        List<ClassPaperResponse> papers = paperRepository.findByAuthor_IdAndPaperSetIsNull(teacherId).stream()
                .filter(paper -> !linked.contains(paper.getId()))
                .map(ClassPaperResponse::from)
                .toList();
        List<SharePaperSetOption> paperSets = paperSetRepository.findByAuthor_IdOrderByTitleAsc(teacherId).stream()
                .map(set -> new SharePaperSetOption(
                        set.getId(),
                        set.getTitle(),
                        set.getAcademicYear(),
                        (int) paperRepository.countByPaperSetId(set.getId())))
                .filter(option -> option.paperCount() > 0 && setHasUnlinkedPaper(option.id(), linked))
                .toList();
        return new ShareOptionsResponse(papers, paperSets);
    }

    @Transactional
    public SharePapersResponse share(UUID teacherId, UUID classroomId, UUID paperId) {
        return share(teacherId, classroomId, new SharePapersRequest(paperId, List.of(), List.of()));
    }

    @Transactional
    public SharePapersResponse share(UUID teacherId, UUID classroomId, SharePapersRequest request) {
        Classroom classroom = requireTeacherOf(teacherId, classroomId);
        if (request == null) {
            return new SharePapersResponse(0);
        }
        int shared = 0;
        if (request.paperId() != null && link(classroom, loadShareable(classroom, request.paperId()))) {
            shared++;
        }
        if (request.paperIds() != null) {
            for (UUID paperId : request.paperIds()) {
                if (paperId != null && link(classroom, loadShareable(classroom, paperId))) {
                    shared++;
                }
            }
        }
        if (request.paperSetIds() != null) {
            for (UUID paperSetId : request.paperSetIds()) {
                if (paperSetId != null) {
                    shared += linkSet(classroom, paperSetId);
                }
            }
        }
        return new SharePapersResponse(shared);
    }

    @Transactional
    public void unshare(UUID teacherId, UUID classroomId, UUID paperId) {
        requireTeacherOf(teacherId, classroomId);
        if (!classroomPaperRepository.existsByClassroom_IdAndPaper_Id(classroomId, paperId)) {
            throw new ResourceNotFoundException("PAPER_NOT_IN_CLASS", "That paper is not in the class");
        }
        classroomPaperRepository.deleteByClassroom_IdAndPaper_Id(classroomId, paperId);
    }

    private boolean link(Classroom classroom, Paper paper) {
        if (classroomPaperRepository.existsByClassroom_IdAndPaper_Id(classroom.getId(), paper.getId())) {
            return false;
        }
        classroomPaperRepository.save(ClassroomPaper.create(classroom, paper));
        return true;
    }

    private int linkSet(Classroom classroom, UUID paperSetId) {
        PaperSet set = paperSetRepository.findById(paperSetId)
                .orElseThrow(() -> new ResourceNotFoundException("PAPER_SET_NOT_FOUND", "Exam set not found: " + paperSetId));
        if (!Objects.equals(set.getAuthor().getId(), classroom.getTeacher().getId())) {
            throw new ForbiddenException("CLASSROOM_FORBIDDEN", "You can only share exam sets you uploaded");
        }
        int shared = 0;
        for (Paper paper : paperRepository.findByPaperSet_Id(paperSetId)) {
            if (link(classroom, paper)) {
                shared++;
            }
        }
        return shared;
    }

    private boolean setHasUnlinkedPaper(UUID paperSetId, Set<UUID> linked) {
        return paperRepository.findByPaperSet_Id(paperSetId).stream()
                .anyMatch(paper -> !linked.contains(paper.getId()));
    }

    private Paper loadShareable(Classroom classroom, UUID paperId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new ResourceNotFoundException("PAPER_NOT_FOUND", "Paper not found: " + paperId));
        if (!Objects.equals(paper.getAuthor().getId(), classroom.getTeacher().getId())) {
            throw new ForbiddenException("CLASSROOM_FORBIDDEN", "You can only share papers you created");
        }
        return paper;
    }

    private Classroom requireTeacherOf(UUID userId, UUID classroomId) {
        Classroom classroom = classroom(classroomId);
        User user = user(userId);
        if (!teaches(user, classroom)) {
            throw new ForbiddenException("CLASSROOM_FORBIDDEN", "You do not teach this class");
        }
        return classroom;
    }

    private boolean teaches(User user, Classroom classroom) {
        return user.getRole() == UserRole.ADMIN || Objects.equals(classroom.getTeacher().getId(), user.getId());
    }

    private Classroom classroom(UUID classroomId) {
        return classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("CLASSROOM_NOT_FOUND", "Class not found: " + classroomId));
    }

    private User user(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found: " + userId));
    }
}
