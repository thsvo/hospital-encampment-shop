"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
      }
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order? This cannot be undone.")) return;
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.filter(o => o._id !== orderId));
      }
    } catch (error) {
      alert("Failed to delete order");
    }
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    confirmed: "bg-green-100 text-green-700 border-green-200",
    shipped: "bg-blue-100 text-blue-700 border-blue-200",
    delivered: "bg-purple-100 text-purple-700 border-purple-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Orders</h1>
          <p className="text-gray-500 mt-1">{orders.length} total orders</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search by email or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchTerm || filterStatus !== "all" ? "No matching orders" : "No orders yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all" ? "Try adjusting your search or filter" : "Orders will appear here when customers make purchases."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>

                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="font-mono text-xs md:text-sm text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-sm font-medium text-secondary">{order.email}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-sm text-gray-500">
                        {order.items.map((item, i) => (
                          <div key={i}>{item.name} × {item.quantity}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-mono font-bold text-secondary">
                      ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-medium rounded-full capitalize border cursor-pointer ${statusColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          href={`/admin/orders/${order._id}`}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
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
