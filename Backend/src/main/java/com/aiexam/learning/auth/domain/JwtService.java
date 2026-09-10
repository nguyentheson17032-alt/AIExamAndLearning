package com.aiexam.learning.auth.domain;

import com.aiexam.learning.common.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
    }

    public String generateAccessToken(UserDetails userDetails) {
        return buildToken(Map.of("type", "access"), userDetails, properties.accessTokenExpiration().toMillis());
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(Map.of("type", "refresh"), userDetails, properties.refreshTokenExpiration().toMillis());
    }

    public String validateAccessTokenAndGetSubject(String token) {
        Claims claims = extractClaims(token);
        if (!"access".equals(claims.get("type", String.class))
                || claims.getExpiration() == null
                || !claims.getExpiration().after(new Date())
                || claims.getSubject() == null
                || claims.getSubject().isBlank()) {
            throw new JwtException("Invalid access token claims");
        }
        return claims.getSubject();
    }

    public String validateRefreshTokenAndGetSubject(String token) {
        Claims claims = extractClaims(token);
        if (!"refresh".equals(claims.get("type", String.class))
                || claims.getExpiration() == null
                || !claims.getExpiration().after(new Date())
                || claims.getSubject() == null
                || claims.getSubject().isBlank()) {
            throw new JwtException("Invalid refresh token claims");
        }
        return claims.getSubject();
    }

    public Instant refreshExpiry() {
        return Instant.now().plus(properties.refreshTokenExpiration());
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .id(UUID.randomUUID().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(signingKey())
                .compact();
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey signingKey() {
        byte[] keyBytes = Decoders.BASE64.decode(properties.secret());
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
