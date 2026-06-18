package com.lmsiac.backend.security;

import com.lmsiac.backend.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {
    private final String secret;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration-ms}") long expirationMs) {
        this.secret = secret;
        this.expirationMs = expirationMs;
    }

    public String generate(Usuario usuario) {
        Date now = new Date();
        return Jwts.builder()
            .subject(usuario.getEmail())
            .claim("rol", usuario.getRol().getNombre())
            .claim("uid", usuario.getId())
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expirationMs))
            .signWith(key())
            .compact();
    }

    public String subject(String token) {
        return claims(token).getSubject();
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }

    private SecretKey key() {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres");
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}
