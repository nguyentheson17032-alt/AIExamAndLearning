package com.aiexam.learning.auth.domain;

import com.aiexam.learning.auth.api.AuthResponse;
import com.aiexam.learning.auth.api.LoginRequest;
import com.aiexam.learning.auth.api.RegisterRequest;
import com.aiexam.learning.auth.infrastructure.RefreshTokenRepository;
import com.aiexam.learning.common.config.EloProperties;
import com.aiexam.learning.common.config.JwtProperties;
import com.aiexam.learning.common.exception.BusinessRuleException;
import com.aiexam.learning.common.exception.ConflictException;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import com.aiexam.learning.user.infrastructure.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final EloProperties eloProperties;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("EMAIL_EXISTS", "Email is already registered");
        }
        User user = userRepository.save(User.register(
                email,
                passwordEncoder.encode(request.password()),
                request.displayName().trim(),
                UserRole.STUDENT,
                eloProperties.defaultRating()
        ));
        return issueTokens(user, UUID.randomUUID());
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
            );
        } catch (AuthenticationException ex) {
            throw new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials");
        }
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new BusinessRuleException("INVALID_CREDENTIALS", "Invalid credentials"));
        return issueTokens(user, UUID.randomUUID());
    }

    @Transactional
    public AuthResponse refresh(String refreshToken) {
        final String email;
        try {
            email = jwtService.validateRefreshTokenAndGetSubject(refreshToken);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BusinessRuleException("INVALID_REFRESH_TOKEN", "Refresh token is invalid");
        }
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash(refreshToken))
                .orElseThrow(() -> new BusinessRuleException("INVALID_REFRESH_TOKEN", "Refresh token is invalid"));
        Instant now = Instant.now();
        if (!stored.isActive(now)) {
            refreshTokenRepository.findByFamilyId(stored.getFamilyId()).forEach(token -> token.revoke(now));
            throw new BusinessRuleException("REFRESH_TOKEN_REUSE", "Refresh token reuse detected");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException("INVALID_REFRESH_TOKEN", "Refresh token is invalid"));
        AuthResponse response = issueTokens(user, stored.getFamilyId());
        RefreshToken replacement = refreshTokenRepository.findByTokenHash(hash(response.refreshToken()))
                .orElseThrow();
        stored.rotateTo(replacement.getId(), now);
        return response;
    }

    private AuthResponse issueTokens(User user, UUID familyId) {
        AuthUserDetails details = new AuthUserDetails(user);
        String access = jwtService.generateAccessToken(details);
        String refresh = jwtService.generateRefreshToken(details);
        refreshTokenRepository.save(RefreshToken.issue(user, hash(refresh), familyId, jwtService.refreshExpiry()));
        return new AuthResponse(
                access,
                refresh,
                jwtProperties.accessTokenExpiration().toSeconds(),
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole(),
                user.getEloRating(),
                user.getRankCode()
        );
    }

    private String hash(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
