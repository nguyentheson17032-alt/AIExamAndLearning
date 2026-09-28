package com.aiexam.learning.classroom.api;

import com.aiexam.learning.auth.domain.CurrentUser;
import com.aiexam.learning.classroom.domain.ClassroomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    public ResponseEntity<ClassroomResponse> create(@Valid @RequestBody ClassroomCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(classroomService.create(CurrentUser.id(), request));
    }

    @GetMapping
    public List<ClassroomResponse> list() {
        return classroomService.list(CurrentUser.require().getUser());
    }

    @PutMapping("/{id}")
    public ClassroomResponse rename(@PathVariable UUID id, @Valid @RequestBody ClassroomCreateRequest request) {
        return classroomService.rename(CurrentUser.id(), id, request);
    }

    @GetMapping("/{id}")
    public ClassroomDetailResponse get(@PathVariable UUID id) {
        return classroomService.get(CurrentUser.require().getUser(), id);
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<ClassroomMemberResponse> addStudent(
            @PathVariable UUID id,
            @Valid @RequestBody AddStudentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(classroomService.addStudent(CurrentUser.id(), id, request));
    }

    @DeleteMapping("/{id}/members/{studentId}")
    public ResponseEntity<Void> removeStudent(@PathVariable UUID id, @PathVariable UUID studentId) {
        classroomService.removeStudent(CurrentUser.id(), id, studentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/papers/available")
    public ShareOptionsResponse available(@PathVariable UUID id) {
        return classroomService.available(CurrentUser.require().getUser(), id);
    }

    @PostMapping("/{id}/papers")
    public SharePapersResponse share(@PathVariable UUID id, @RequestBody(required = false) SharePapersRequest request) {
        return classroomService.share(CurrentUser.id(), id, request);
    }

    @DeleteMapping("/{id}/papers/{paperId}")
    public ResponseEntity<Void> unshare(@PathVariable UUID id, @PathVariable UUID paperId) {
        classroomService.unshare(CurrentUser.id(), id, paperId);
        return ResponseEntity.noContent().build();
    }
}
