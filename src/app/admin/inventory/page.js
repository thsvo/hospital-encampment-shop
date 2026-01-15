"use client";

import { useState, useEffect } from "react";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
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

  const updateStock = async (productId, newStock) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: parseInt(newStock) || 0 }),
      });
      if (res.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error("Failed to update stock");
    }
  };

  const getStockBadge = (product) => {
    const qty = product.stockQuantity || 0;
    const threshold = product.lowStockThreshold || 5;
    
    if (qty <= 0) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Out of Stock</span>;
    } else if (qty <= threshold) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Low Stock ({qty})</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">In Stock ({qty})</span>;
  };

  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) <= (p.lowStockThreshold || 5));
  const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) <= 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary">Inventory Management</h1>
        <p className="text-gray-500 mt-1">Track and manage your stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-medium">In Stock</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{products.length - lowStockProducts.length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-medium">Low Stock</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{lowStockProducts.length - outOfStockProducts.length}</p>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-medium">Out of Stock</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{outOfStockProducts.length}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Attention Needed ({lowStockProducts.length} items)
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map(p => (
              <span key={p._id} className={`px-3 py-1 rounded-lg text-sm border font-medium ${
                p.stockQuantity <= 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-100 border-yellow-200 text-yellow-700'
              }`}>
                {p.name}: {p.stockQuantity <= 0 ? 'Empty' : `${p.stockQuantity} left`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Alert Limit</th>
                  <th className="px-3 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="font-medium text-secondary text-sm md:text-base">{product.name}</div>
                      <div className="text-[10px] md:text-xs text-gray-400 uppercase">{product.sub}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <div className="flex items-center justify-center gap-1 md:gap-2">
                        <button 
                          onClick={() => updateStock(product._id, Math.max(0, (product.stockQuantity || 0) - 1))}
                          className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={product.stockQuantity || 0}
                          onChange={(e) => updateStock(product._id, e.target.value)}
                          className="w-16 md:w-20 px-1 md:px-2 py-1 text-center font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
                        />
                        <button 
                          onClick={() => updateStock(product._id, (product.stockQuantity || 0) + 1)}
                          className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center text-gray-500 text-sm md:text-base">
                      {product.lowStockThreshold || 5}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-center">
                      <div className="scale-90 md:scale-100 origin-center">
                        {getStockBadge(product)}
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
