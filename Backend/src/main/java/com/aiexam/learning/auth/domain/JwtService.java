package com.aiexam.learning.auth.domain;

import com.aiexam.learning.common.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.io.DecodingException;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(decodeSecret(properties.secret()));
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
                .signWith(signingKey)
                .compact();
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    static byte[] decodeSecret(String secret) {
        byte[] decoded = tryDecodeBase64(secret);
        if (decoded != null && decoded.length >= 32) {
            return decoded;
        }
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length >= 32) {
            return raw;
        }
        return sha256(raw);
    }

    private static byte[] tryDecodeBase64(String secret) {
        try {
            return Decoders.BASE64.decode(secret);
        } catch (DecodingException ignored) {
            try {
                return Decoders.BASE64URL.decode(secret);
            } catch (DecodingException ignoredUrl) {
                return null;
            }
        }
    }

    private static byte[] sha256(byte[] input) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(input);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is required to derive a JWT HMAC key", ex);
        }
    }
}
