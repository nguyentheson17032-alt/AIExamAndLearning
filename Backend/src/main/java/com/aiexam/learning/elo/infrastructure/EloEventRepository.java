package com.aiexam.learning.elo.infrastructure;

import com.aiexam.learning.elo.domain.EloEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.UUID;

public interface EloEventRepository extends JpaRepository<EloEvent, UUID> {

    Page<EloEvent> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    void deleteByAttempt_IdIn(Collection<UUID> attemptIds);

    void deleteByQuestion_IdIn(Collection<UUID> questionIds);
}
