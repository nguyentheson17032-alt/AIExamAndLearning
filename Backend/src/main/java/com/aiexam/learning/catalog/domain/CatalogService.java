package com.aiexam.learning.catalog.domain;

import com.aiexam.learning.catalog.api.SubjectCreateRequest;
import com.aiexam.learning.catalog.api.SubjectResponse;
import com.aiexam.learning.catalog.api.TopicCreateRequest;
import com.aiexam.learning.catalog.api.TopicResponse;
import com.aiexam.learning.catalog.infrastructure.SubjectRepository;
import com.aiexam.learning.catalog.infrastructure.TopicRepository;
import com.aiexam.learning.common.api.PageResponse;
import com.aiexam.learning.common.exception.ConflictException;
import com.aiexam.learning.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CatalogService {

    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;

    @Transactional
    public SubjectResponse createSubject(SubjectCreateRequest request) {
        String code = request.code().trim().toUpperCase();
        if (subjectRepository.existsByCode(code)) {
            throw new ConflictException("SUBJECT_CODE_EXISTS", "Subject code already exists: " + code);
        }
        Subject saved = subjectRepository.save(Subject.create(code, request.name().trim(), request.description()));
        return SubjectResponse.from(saved);
    }

    public PageResponse<SubjectResponse> listSubjects(Pageable pageable) {
        return PageResponse.from(subjectRepository.findAll(pageable).map(SubjectResponse::from));
    }

    public Subject getSubject(UUID id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SUBJECT_NOT_FOUND", "Subject not found: " + id));
    }

    public SubjectResponse getSubjectResponse(UUID id) {
        return SubjectResponse.from(getSubject(id));
    }

    @Transactional
    public TopicResponse createTopic(UUID subjectId, TopicCreateRequest request) {
        Subject subject = getSubject(subjectId);
        if (topicRepository.existsBySubjectIdAndNameIgnoreCase(subjectId, request.name().trim())) {
            throw new ConflictException("TOPIC_NAME_EXISTS", "Topic already exists in this subject");
        }
        Topic saved = topicRepository.save(Topic.create(subject, request.name().trim(), request.description()));
        return TopicResponse.from(saved);
    }

    public PageResponse<TopicResponse> listTopics(UUID subjectId, Pageable pageable) {
        getSubject(subjectId);
        return PageResponse.from(topicRepository.findBySubjectId(subjectId, pageable).map(TopicResponse::from));
    }

    public Topic getTopic(UUID id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TOPIC_NOT_FOUND", "Topic not found: " + id));
    }
}
