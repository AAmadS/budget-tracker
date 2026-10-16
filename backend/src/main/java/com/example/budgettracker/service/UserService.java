
package com.example.budgettracker.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.budgettracker.dto.CreateUserRequest;
import com.example.budgettracker.dto.LoginRequest;
import com.example.budgettracker.dto.UpdateUserProfileRequest;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.User;
import com.example.budgettracker.repository.CategoryRepository;
import com.example.budgettracker.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public UserService(
            UserRepository userRepository,
            CategoryRepository categoryRepository) {

        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public User createUser(CreateUserRequest request) {

        // Check required fields
        if (request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()
                || request.getFirstName() == null || request.getFirstName().isBlank()
                || request.getLastName() == null || request.getLastName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please fill in all required fields");
        }

        // Clean up input
        String email = request.getEmail().trim().toLowerCase();
        String firstName = request.getFirstName().trim();
        String lastName = request.getLastName().trim();
        String phoneNumber = request.getPhoneNumber();

        if (phoneNumber != null) {
            phoneNumber = phoneNumber.trim();

            if (phoneNumber.isEmpty()) {
                phoneNumber = null;
            }
        }

        // Check password length
        if (request.getPassword().length() < 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be at least 8 characters");
        }

        // Check duplicate email
        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered");
        }

        // Save new user
        User newUser = new User(
                email,
                request.getPassword(),
                firstName,
                lastName,
                phoneNumber);

        User savedUser = userRepository.save(newUser);

        // Create default categories for the new user.
        List<String> defaultCategoryNames = List.of(
                "Groceries",
                "Housing",
                "Transportation",
                "Utilities",
                "Entertainment",
                "Healthcare",
                "Salary"
        );

        List<Category> defaultCategories = defaultCategoryNames.stream()
                .map(name -> new Category(savedUser, name))
                .toList();

        categoryRepository.saveAll(defaultCategories);

        return savedUser;
    }

    // Finds the user by email and verifies their password.
    // Returns the user to the controller to generate a token.
    public User loginUser(LoginRequest request) {

        if (request == null
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required");
        }

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        return user;
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));
    }

    public User updateUser(Long userId, UpdateUserProfileRequest request) {

        User user = getUserById(userId);

        if (request.getFirstName() != null) {
            if (request.getFirstName().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "First name cannot be blank");
            }
            user.setFirstName(request.getFirstName().trim());
        }

        if (request.getLastName() != null) {
            if (request.getLastName().isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Last name cannot be blank");
            }
            user.setLastName(request.getLastName().trim());
        }

        if (request.getEmail() != null) {
            String email = request.getEmail().trim().toLowerCase();

            if (email.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Email cannot be blank");
            }

            User existing = userRepository.findByEmail(email).orElse(null);

            if (existing != null && !existing.getId().equals(userId)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT, "Email is already registered");
            }

            user.setEmail(email);
        }

        if (request.getPassword() != null) {
            if (request.getPassword().length() < 8) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Password must be at least 8 characters");
            }

            user.setPassword(request.getPassword());
        }

        if (request.getPhoneNumber() != null) {
            String phone = request.getPhoneNumber().trim();
            user.setPhoneNumber(phone.isEmpty() ? null : phone);
        }

        return userRepository.save(user);
    }
}
