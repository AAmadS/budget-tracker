
package com.example.budgettracker.dto;

public class CategoryRequest {

    private String categoryName;

    // Required for JSON deserialization
    public CategoryRequest() {
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }
}
