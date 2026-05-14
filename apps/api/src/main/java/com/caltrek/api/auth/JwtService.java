package com.caltrek.api.auth;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };
    private final ObjectMapper objectMapper;
    private final byte[] secret;
    private final Duration accessTokenTtl;

    public JwtService(
            ObjectMapper objectMapper,
            @Value("${caltrek.security.jwt-secret}") String jwtSecret,
            @Value("${caltrek.security.access-token-ttl}") Duration accessTokenTtl) {
        if (jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes.");
        }
        this.objectMapper = objectMapper;
        this.secret = jwtSecret.getBytes(StandardCharsets.UTF_8);
        this.accessTokenTtl = accessTokenTtl;
    }

    public AuthToken createAccessToken(AuthenticatedUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(accessTokenTtl);
        Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("sub", user.id().toString());
        claims.put("email", user.email());
        claims.put("iat", now.getEpochSecond());
        claims.put("exp", expiresAt.getEpochSecond());
        return new AuthToken(sign(header, claims), expiresAt);
    }

    public AuthenticatedUser validate(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new AuthException("Invalid access token.");
        }
        String signature = hmac(parts[0] + "." + parts[1]);
        if (!constantTimeEquals(signature, parts[2])) {
            throw new AuthException("Invalid access token.");
        }
        Map<String, Object> claims = readJson(parts[1]);
        Instant expiresAt = Instant.ofEpochSecond(asLong(claims.get("exp")));
        if (!expiresAt.isAfter(Instant.now())) {
            throw new AuthException("Access token expired.");
        }
        return new AuthenticatedUser(
                UUID.fromString(String.valueOf(claims.get("sub"))),
                String.valueOf(claims.get("email")));
    }

    private String sign(Map<String, Object> header, Map<String, Object> claims) {
        String encodedHeader = encodeJson(header);
        String encodedClaims = encodeJson(claims);
        String signingInput = encodedHeader + "." + encodedClaims;
        return signingInput + "." + hmac(signingInput);
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to encode token.", exception);
        }
    }

    private Map<String, Object> readJson(String value) {
        try {
            return objectMapper.readValue(BASE64_URL_DECODER.decode(value), MAP_TYPE);
        } catch (Exception exception) {
            throw new AuthException("Invalid access token.");
        }
    }

    private String hmac(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign token.", exception);
        }
    }

    private long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private boolean constantTimeEquals(String expected, String actual) {
        return java.security.MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                actual.getBytes(StandardCharsets.UTF_8));
    }
}
