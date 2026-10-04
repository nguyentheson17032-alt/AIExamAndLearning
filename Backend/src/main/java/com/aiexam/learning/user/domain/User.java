package com.aiexam.learning.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(name = "elo_rating", nullable = false)
    private int eloRating;

    @Enumerated(EnumType.STRING)
    @Column(name = "rank_code", nullable = false)
    private RankCode rankCode;

    @Column(nullable = false)
    private boolean enabled;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public static User register(String email, String passwordHash, String displayName, UserRole role, int eloRating) {
        User user = new User();
        user.email = email.toLowerCase();
        user.passwordHash = passwordHash;
        user.displayName = displayName;
        user.role = role;
        user.eloRating = eloRating;
        user.rankCode = RankCode.fromElo(eloRating);
        user.enabled = true;
        return user;
    }

    public void applyElo(int newRating) {
        this.eloRating = newRating;
        RankCode theoreticalRank = RankCode.fromElo(newRating);
        if (this.rankCode == null) {
            this.rankCode = theoreticalRank;
        } else if (theoreticalRank.ordinal() < this.rankCode.ordinal()) {
            // Demote rank if rating drops below rank minimum threshold
            this.rankCode = theoreticalRank;
        }
    }

    public void promoteTo(RankCode newRank) {
        if (newRank != null && (this.rankCode == null || newRank.ordinal() > this.rankCode.ordinal())) {
            this.rankCode = newRank;
        }
    }

    public void disable() {
        this.enabled = false;
    }
}
