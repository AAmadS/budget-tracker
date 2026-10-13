
package com.example.budgettracker.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.budgettracker.dto.CreateUserRequest;
import com.example.budgettracker.dto.LoginRequest;
import com.example.budgettracker.dto.LoginResponse;
import com.example.budgettracker.model.User;
import com.example.budgettracker.service.UserService;
import com.example.budgettracker.service.AuthTokenService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthTokenService authTokenService;

    public AuthController(
            UserService userService,
            AuthTokenService authTokenService) {

        this.userService = userService;
        this.authTokenService = authTokenService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@RequestBody CreateUserRequest request) {
        userService.createUser(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        User user = userService.loginUser(request);
        String token = authTokenService.createToken(user);

        return new LoginResponse(token, user.getId());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader("Authorization") String authorization) {

        authTokenService.logout(authorization);
    }
}
