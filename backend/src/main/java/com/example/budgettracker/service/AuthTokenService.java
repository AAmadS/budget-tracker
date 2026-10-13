package com.example.budgettracker.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.budgettracker.model.User;

@Service
public class AuthTokenService {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String createToken(User user) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, user.getId());
        return token;
    }

    public Long validateToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication required"
            );
        }

        String token = authorization.substring(7);
        Long userId = tokens.get(token);

        if (userId == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid or expired token"
            );
        }

        return userId;
    }

    public void logout(String authorization) {
        Long userId = validateToken(authorization);
        String token = authorization.substring(7);
        tokens.remove(token);
    }
}
