
"use client";

import { useEffect, useState } from "react";

type Category = {
    id: number;
    categoryName: string;
};

export default function CategoryList() {
    // Stores categories and form values
    const [categories, setCategories] = useState<Category[]>([]);
    const [newName, setNewName] = useState("");
    const [editName, setEditName] = useState("");

    // Tracks which category is being edited or deleted
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Tracks requests and error messages
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [validationError, setValidationError] = useState("");

    // GET: Loads the user's categories
    async function loadCategories() {
        const token = sessionStorage.getItem("authToken");

        try {
            const response = await fetch("http://localhost:8080/api/categories", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load categories.");
            }

            const data: Category[] = await response.json();
            setCategories(data);
            setError("");
        } catch {
            setError("Could not load categories.");
        }
    }

    // Loads categories when the component appears
    useEffect(() => {
        loadCategories();
    }, []);

    // POST: Creates a new category
    async function handleAdd(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        // Checks for an empty category name
        if (!newName.trim()) {
            setValidationError("Please enter a category name.");
            return;
        }

        setValidationError("");
        setBusy(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            const response = await fetch("http://localhost:8080/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    categoryName: newName.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create category.");
            }

            setNewName("");
            await loadCategories();
        } catch {
            setError("Could not add category.");
        } finally {
            setBusy(false);
        }
    }

    // Fills the edit field with the selected category name
    function startEditing(category: Category) {
        setEditingId(category.id);
        setDeletingId(null);
        setEditName(category.categoryName);
        setError("");
    }

    // PUT: Updates an existing category
    async function handleEdit(categoryId: number) {
        if (!editName.trim()) {
            setError("Category name cannot be empty.");
            return;
        }

        setBusy(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            const response = await fetch(
                `http://localhost:8080/api/categories/${categoryId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        categoryName: editName.trim(),
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update category.");
            }

            setEditingId(null);
            await loadCategories();
        } catch {
            setError("Could not update category.");
        } finally {
            setBusy(false);
        }
    }

    // DELETE: Removes a category after confirmation
    async function handleDelete(categoryId: number) {
        setBusy(true);
        setError("");

        try {
            const token = sessionStorage.getItem("authToken");

            const response = await fetch(
                `http://localhost:8080/api/categories/${categoryId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete category.");
            }

            setDeletingId(null);
            await loadCategories();
        } catch {
            setError("Could not delete category.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="category-list">
            <h2>My Categories</h2>

            {/* Form for creating categories */}
            <form onSubmit={handleAdd}>
                <label htmlFor="newCategory" className="form-label">
                    Category name
                </label>

                <input
                    id="newCategory"
                    className="form-input"
                    placeholder="Enter category name"
                    value={newName}
                    onChange={(event) => {
                        setNewName(event.target.value);
                        setValidationError("");
                    }}
                />

                {/* Displays a message if the input is empty */}
                {validationError && (
                    <p role="alert" className="error-message">
                        {validationError}
                    </p>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={busy}
                >
                    {busy ? "Adding..." : "Add Category"}
                </button>
            </form>

            {/* Displays API errors */}
            {error && (
                <p role="alert" className="error-message">
                    {error}
                </p>
            )}

            {/* Shows a message if no categories exist */}
            {categories.length === 0 ? (
                <p className="empty-message">No categories added yet.</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* Displays each category in its own row */}
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>
                                    {/* Shows an input when editing */}
                                    {editingId === category.id ? (
                                        <input
                                            aria-label="Edit category name"
                                            className="form-input"
                                            value={editName}
                                            onChange={(event) =>
                                                setEditName(event.target.value)
                                            }
                                        />
                                    ) : (
                                        category.categoryName
                                    )}
                                </td>

                                <td>
                                    {/* Editing: Save and Cancel */}
                                    {editingId === category.id ? (
                                        <>
                                            <button
                                                type="button"
                                                className="action-edit"
                                                disabled={busy}
                                                onClick={() => handleEdit(category.id)}
                                            >
                                                Save
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => setEditingId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : deletingId === category.id ? (
                                        <>
                                            {/* Deleting: Confirm and Cancel */}
                                            <span>Delete? </span>

                                            <button
                                                type="button"
                                                className="action-delete"
                                                disabled={busy}
                                                onClick={() => handleDelete(category.id)}
                                            >
                                                Confirm
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busy}
                                                onClick={() => setDeletingId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            {/* Default: Edit and Delete */}
                                            <button
                                                type="button"
                                                className="action-edit"
                                                disabled={busy}
                                                onClick={() => startEditing(category)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="action-delete"
                                                disabled={busy}
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setDeletingId(category.id);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
}
