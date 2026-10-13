package com.example.budgettracker.util;

import java.security.SecureRandom;
import java.util.Base64;

public class PasswordUtil {

    public static String generateSalt() {
        byte[] salt = new byte[16];

        SecureRandom random = new SecureRandom();
        random.nextBytes(salt);

        return Base64.getEncoder().encodeToString(salt);
    }

}
