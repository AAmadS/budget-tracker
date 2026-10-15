
package com.example.budgettracker.service;

import com.example.budgettracker.dto.CategoryRequest;
import com.example.budgettracker.dto.CategoryResponse;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.User;
import com.example.budgettracker.repository.CategoryRepository;
import com.example.budgettracker.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    // Creates a category for the logged-in user
    public CategoryResponse createCategory(Long userId, CategoryRequest request) {
        String name = validateName(request.getCategoryName());

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        Category category = new Category(user, name);
        Category savedCategory = categoryRepository.save(category);

        return toResponse(savedCategory);
    }

    // Returns all categories belonging to the user
    public List<CategoryResponse> getCategories(Long userId) {
        return categoryRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Renames an existing category
    public CategoryResponse updateCategory(
            Long userId,
            Long categoryId,
            CategoryRequest request) {

        Category category = findUserCategory(userId, categoryId);

        category.setCategoryName(validateName(request.getCategoryName()));

        Category updatedCategory = categoryRepository.save(category);

        return toResponse(updatedCategory);
    }

    // Deletes a category owned by the user
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = findUserCategory(userId, categoryId);
        categoryRepository.delete(category);
    }

    // Finds a category and checks that it belongs to the user
    private Category findUserCategory(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUser_Id(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));
    }

    // Checks that the category name is not blank
    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category name is required");
        }

        return name.trim().replaceAll("\\s+", " ");
    }

    // Converts a database entity into a response DTO
    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getCategoryName());
    }
}
