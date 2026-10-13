
package com.example.budgettracker.controller;

import org.springframework.web.bind.annotation.*;

import com.example.budgettracker.dto.UpdateUserProfileRequest;
import com.example.budgettracker.dto.UserProfileResponse;
import com.example.budgettracker.model.User;
import com.example.budgettracker.service.AuthTokenService;
import com.example.budgettracker.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthTokenService authTokenService;

    public UserController(
            UserService userService,
            AuthTokenService authTokenService) {
        this.userService = userService;
        this.authTokenService = authTokenService;
    }

    @GetMapping("/me")
    public UserProfileResponse getProfile(
            @RequestHeader("Authorization") String authorization) {

        Long userId = authTokenService.validateToken(authorization);
        User user = userService.getUserById(userId);

        return new UserProfileResponse(user);
    }

    @PutMapping("/me")
    public UserProfileResponse updateProfile(
            @RequestHeader("Authorization") String authorization,
            @RequestBody UpdateUserProfileRequest request) {

        Long userId = authTokenService.validateToken(authorization);
        User user = userService.updateUser(userId, request);

        return new UserProfileResponse(user);
    }
}
