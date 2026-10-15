
package com.example.budgettracker.dto;

public class CategoryResponse {

    private Long id;
    private String categoryName;

    public CategoryResponse(Long id, String categoryName) {
        this.id = id;
        this.categoryName = categoryName;
    }

    public Long getId() {
        return id;
    }

    public String getCategoryName() {
        return categoryName;
    }
}
