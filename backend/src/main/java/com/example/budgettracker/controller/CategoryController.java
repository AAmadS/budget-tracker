
package com.example.budgettracker.controller;

import com.example.budgettracker.dto.CategoryRequest;
import com.example.budgettracker.dto.CategoryResponse;
import com.example.budgettracker.service.AuthTokenService;
import com.example.budgettracker.service.CategoryService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final AuthTokenService authTokenService;

    public CategoryController(
            CategoryService categoryService,
            AuthTokenService authTokenService) {
        this.categoryService = categoryService;
        this.authTokenService = authTokenService;
    }

    // POST: Creates a category
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CategoryRequest request) {

        Long userId = authTokenService.validateToken(authorization);

        CategoryResponse category = categoryService.createCategory(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    // GET: Lists the user's categories
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @RequestHeader("Authorization") String authorization) {

        Long userId = authTokenService.validateToken(authorization);

        return ResponseEntity.ok(categoryService.getCategories(userId));
    }

    // PUT: Renames a category
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id,
            @RequestBody CategoryRequest request) {

        Long userId = authTokenService.validateToken(authorization);

        return ResponseEntity.ok(
                categoryService.updateCategory(userId, id, request));
    }

    // DELETE: Removes a category
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @RequestHeader("Authorization") String authorization,
            @PathVariable Long id) {

        Long userId = authTokenService.validateToken(authorization);

        categoryService.deleteCategory(userId, id);

        return ResponseEntity.noContent().build();
    }
}
