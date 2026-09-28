package com.aiexam.learning.user.infrastructure;

import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByDisplayNameIgnoreCaseAndRoleAndEnabled(String displayName, UserRole role, boolean enabled);
}
