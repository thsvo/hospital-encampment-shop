"use client";

import { useState, useEffect } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sub: "Lyophilized",
    category: "",
    price: "",
    costPrice: "",
    stockQuantity: "",
    lowStockThreshold: "5",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  const handleAddCategory = async () => {
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
        setFormData({ ...formData, category: data.data.name });
        setNewCategory("");
        setShowCategoryInput(false);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to add category");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingProduct 
      ? `/api/products/${editingProduct._id}` 
      : "/api/products";
    const method = editingProduct ? "PATCH" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          sub: formData.sub,
          category: formData.category,
          price: parseFloat(formData.price),
          costPrice: parseFloat(formData.costPrice) || 0,
          stockQuantity: parseInt(formData.stockQuantity) || 0,
          lowStockThreshold: parseInt(formData.lowStockThreshold) || 5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchProducts();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sub: product.sub,
      category: product.category || "Peptides",
      price: product.price.toString(),
      costPrice: (product.costPrice || 0).toString(),
      stockQuantity: (product.stockQuantity || 0).toString(),
      lowStockThreshold: (product.lowStockThreshold || 5).toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p._id !== productId));
      }
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    
    // Optimistic update - swap in local state immediately
    const newProducts = [...products];
    [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
    setProducts(newProducts);
    
    const productToMove = products[index];
    const productAbove = products[index - 1];
    
    try {
      // Update orders in database
      await Promise.all([
        fetch(`/api/products/${productToMove._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index - 1 }),
        }),
        fetch(`/api/products/${productAbove._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        }),
      ]);
    } catch (error) {
      // Revert on error
      setProducts(products);
      alert("Failed to reorder product");
    }
  };

  const handleMoveDown = async (index) => {
    if (index === products.length - 1) return;
    
    // Optimistic update - swap in local state immediately
    const newProducts = [...products];
    [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
    setProducts(newProducts);
    
    const productToMove = products[index];
    const productBelow = products[index + 1];
    
    try {
      // Update orders in database
      await Promise.all([
        fetch(`/api/products/${productToMove._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 1 }),
        }),
        fetch(`/api/products/${productBelow._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        }),
      ]);
    } catch (error) {
      // Revert on error
      setProducts(products);
      alert("Failed to reorder product");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({ name: "", sub: "Lyophilized", category: "", price: "", costPrice: "", stockQuantity: "", lowStockThreshold: "5" });
    setShowCategoryInput(false);
    setNewCategory("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Products</h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => { 
            setEditingProduct(null); 
            setFormData({ name: "", sub: "Lyophilized", category: "", price: "", costPrice: "", stockQuantity: "", lowStockThreshold: "5" });
            setShowForm(true); 
          }}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={resetForm}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-secondary mb-6">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Retatrutide 15mg"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type / Subtitle</label>
                <input
                  type="text"
                  placeholder="Lyophilized"
                  value={formData.sub}
                  onChange={(e) => setFormData({ ...formData, sub: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                {showCategoryInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCategoryInput(false); setNewCategory(""); }}
                      className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCategoryInput(true)}
                      className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium"
                    >
                      + New
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="99.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock Qty</label>
                <input
                  type="number"
                  min="0"
                  placeholder="100"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert Limit</label>
                <input
                  type="number"
                  min="0"
                  placeholder="5"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div className="md:col-span-2 flex gap-3 pt-4 border-t border-gray-100 mt-2">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="flex-1 py-3 px-6 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-3 px-6 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  {editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No products yet. Add your first one!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16 md:w-20">Order</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-4 py-3 md:py-4">
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <span className="text-xs text-gray-400 font-medium">{index + 1}</span>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === products.length - 1}
                          className="p-1 text-gray-400 hover:text-primary hover:bg-primary/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="font-medium text-secondary text-sm md:text-base">{product.name}</div>
                      <div className="text-[10px] md:text-xs text-gray-400">
                        <span className="uppercase">{product.sub}</span>
                        {product.category && (
                          <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[9px] md:text-[10px] font-medium">
                            {product.category}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-mono text-gray-500 text-sm md:text-base">
                      ${(product.costPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-mono font-bold text-secondary text-sm md:text-base">
                      ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(product)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
