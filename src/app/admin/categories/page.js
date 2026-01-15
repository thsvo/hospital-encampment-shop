"use client";

import { useState, useEffect } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setNewCategory("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to add category");
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!editingName.trim()) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(c => c._id === id ? data.data : c));
        setEditingId(null);
        setEditingName("");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter(c => c._id !== id));
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary">Categories</h1>
        <p className="text-gray-500 mt-1">Manage product categories for filtering</p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Enter new category name (e.g., GLP-1, Peptides)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Category
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No categories yet. Add your first category above!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div key={category._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors">
                {editingId === category._id ? (
                  <div className="flex-1 flex gap-3">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateCategory(category._id)}
                      className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditingName(""); }}
                      className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="w-3 h-3 bg-primary/20 rounded-full"></span>
                      <span className="font-medium text-secondary">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingId(category._id); setEditingName(category.name); }}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
