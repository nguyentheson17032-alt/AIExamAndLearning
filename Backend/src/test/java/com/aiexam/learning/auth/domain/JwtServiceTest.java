package com.aiexam.learning.auth.domain;

import com.aiexam.learning.common.config.JwtProperties;
import com.aiexam.learning.user.domain.User;
import com.aiexam.learning.user.domain.UserRole;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(new JwtProperties(
                "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
                Duration.ofMinutes(15),
                Duration.ofDays(7)
        ));
    }

    @Test
    void validateAccessTokenAndGetSubject_whenAccessToken_returnsEmail() {
        AuthUserDetails details = new AuthUserDetails(
                User.register("student@exam.local", "hash", "Student", UserRole.STUDENT, 1000));
        String token = jwtService.generateAccessToken(details);
        assertThat(jwtService.validateAccessTokenAndGetSubject(token)).isEqualTo("student@exam.local");
    }

    @Test
    void validateAccessTokenAndGetSubject_whenRefreshToken_throws() {
        AuthUserDetails details = new AuthUserDetails(
                User.register("student@exam.local", "hash", "Student", UserRole.STUDENT, 1000));
        String refresh = jwtService.generateRefreshToken(details);
        assertThatThrownBy(() -> jwtService.validateAccessTokenAndGetSubject(refresh))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void generateAccessToken_whenSecretIsBase64Url_signsAndValidates() {
        JwtService urlSafeService = new JwtService(new JwtProperties(
                "Gn3LC2IzsWBZngUzAakJRYJb0dadgo6Cat00h_LuV4I=",
                Duration.ofMinutes(15),
                Duration.ofDays(7)
        ));
        AuthUserDetails details = new AuthUserDetails(
                User.register("student@exam.local", "hash", "Student", UserRole.STUDENT, 1000));
        String token = urlSafeService.generateAccessToken(details);
        assertThat(urlSafeService.validateAccessTokenAndGetSubject(token)).isEqualTo("student@exam.local");
    }

    @Test
    void generateAccessToken_whenSecretIsRawUtf8WithUnderscore_signsAndValidates() {
        JwtService rawService = new JwtService(new JwtProperties(
                "local_dev_jwt_secret_key_32bytes_min",
                Duration.ofMinutes(15),
                Duration.ofDays(7)
        ));
        AuthUserDetails details = new AuthUserDetails(
                User.register("student@exam.local", "hash", "Student", UserRole.STUDENT, 1000));
        String token = rawService.generateAccessToken(details);
        assertThat(rawService.validateAccessTokenAndGetSubject(token)).isEqualTo("student@exam.local");
    }
}
