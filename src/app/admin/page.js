"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/orders"),
        ]);
        const productsData = await productsRes.json();
        const ordersData = await ordersRes.json();

        if (productsData.success) setProducts(productsData.data);
        if (ordersData.success) setOrders(ordersData.data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

  // Calculate stats
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalCost = orders.reduce((acc, order) => {
    return acc + order.items.reduce((itemAcc, item) => {
      const product = products.find(p => p._id === item.productId);
      return itemAcc + (product?.costPrice || 0) * item.quantity;
    }, 0);
  }, 0);
  const totalProfit = totalRevenue - totalCost;
  
  const lowStockProducts = products.filter(p => (p.stockQuantity || 0) <= (p.lowStockThreshold || 5));
  const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0);
  
  const inventoryCostValue = products.reduce((acc, p) => acc + (p.costPrice || 0) * (p.stockQuantity || 0), 0);
  const inventoryRetailValue = products.reduce((acc, p) => acc + p.price * (p.stockQuantity || 0), 0);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-700 font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              {outOfStockProducts.length > 0 ? (
                <span>{outOfStockProducts.length} out of stock • {lowStockProducts.length - outOfStockProducts.length} low stock</span>
              ) : (
                <span>{lowStockProducts.length} products low on stock</span>
              )}
            </div>
            <Link href="/admin/products" className="text-yellow-700 hover:underline text-sm">View All →</Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-3 md:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase">Products</p>
              <p className="text-lg md:text-2xl font-bold text-secondary">{products.length}</p>
            </div>
          </div>
        </div>



        <div className="bg-white p-3 md:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase">Orders</p>
              <p className="text-lg md:text-2xl font-bold text-secondary">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 md:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase">Revenue</p>
              <p className="text-lg md:text-2xl font-bold text-secondary truncate">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 md:p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalProfit >= 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase">Profit</p>
              <p className={`text-lg md:text-2xl font-bold truncate ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory & Financial Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-secondary mb-4">Inventory Value</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Cost Value</span>
              <span className="font-bold">${inventoryCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Retail Value</span>
              <span className="font-bold">${inventoryRetailValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-500">Potential Profit</span>
              <span className="font-bold text-green-600">+${(inventoryRetailValue - inventoryCostValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-secondary mb-4">Stock Overview</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total Products</span>
              <span className="font-bold">{products.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">In Stock</span>
              <span className="font-bold text-green-600">{products.length - lowStockProducts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Low Stock</span>
              <span className="font-bold text-yellow-600">{lowStockProducts.length - outOfStockProducts.length}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-500">Out of Stock</span>
              <span className="font-bold text-red-600">{outOfStockProducts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-secondary">Recent Orders</h2>
          <Link href="/admin/orders" className="text-primary hover:underline text-sm">View All →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No orders yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-secondary">{order.firstName} {order.lastName}</div>
                    <div className="text-xs text-gray-400">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.items.length} items</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-secondary">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                      order.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
