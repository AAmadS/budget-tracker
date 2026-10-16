
package com.example.budgettracker.repository;

import com.example.budgettracker.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Finds all categories belonging to a user
    List<Category> findByUserId(Long userId);

    // Finds one category only if the user owns it
    Optional<Category> findByIdAndUser_Id(Long categoryId, Long userId);

    // Checks whether the user already has a category with this name
    boolean existsByUser_IdAndCategoryNameIgnoreCase(Long userId, String categoryName);
}
