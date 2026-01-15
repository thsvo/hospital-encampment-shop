"use client";

import { useState, useEffect } from "react";

export default function ProfitPage() {
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
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-gray-500">Loading financials...</div>;
  }

  // Financial Calculations
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

  // Calculate COGS (Cost of Goods Sold) based on ORDERS
  const totalCOGS = orders.reduce((acc, order) => {
    return acc + order.items.reduce((itemAcc, item) => {
      const product = products.find(p => p._id === item.productId);
      return itemAcc + (product?.costPrice || 0) * item.quantity;
    }, 0);
  }, 0);

  const netProfit = totalRevenue - totalCOGS;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Inventory Value (Unsold Stock)
  const inventoryCostValue = products.reduce((acc, p) => acc + (p.costPrice || 0) * (p.stockQuantity || 0), 0);
  const inventoryRetailValue = products.reduce((acc, p) => acc + p.price * (p.stockQuantity || 0), 0);
  const potentialProfit = inventoryRetailValue - inventoryCostValue;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-secondary">Profit & Loss</h1>
        <p className="text-gray-500 mt-1">Financial health and performance tracking</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-secondary mt-1">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-2">Gross Sales</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-medium">COGS</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">${totalCOGS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400 mt-2">Cost of Goods Sold</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-medium">Net Profit</p>
          <p className={`text-3xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netProfit >= 0 ? '+' : '-'}${Math.abs(netProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-400 mt-2">Revenue - Costs</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-medium">Profit Margin</p>
          <p className={`text-3xl font-bold mt-1 ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {profitMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-2">Net Profit / Revenue</p>
        </div>
      </div>

      {/* Inventory Valuation Section */}
      <h2 className="text-xl font-bold text-secondary pt-4">Inventory Valuation</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500">Inventory Cost Basis</p>
            <p className="text-2xl font-bold text-secondary mt-1">${inventoryCostValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400 mt-1">Value of unsold stock at cost</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
              <path d="M4.5 3.75a3 3 0 0 0-3 3v.75h21v-.75a3 3 0 0 0-3-3h-15Z" />
              <path fillRule="evenodd" d="M22.5 9.75h-21v7.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-7.5Zm-18 3.75a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500">Projected Retail Value</p>
            <p className="text-2xl font-bold text-secondary mt-1">${inventoryRetailValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400 mt-1">Value if all stock sells today</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
              <path d="M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
              <path fillRule="evenodd" d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z" clipRule="evenodd" />
              <path d="M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-medium text-gray-500">Potential Future Profit</p>
            <p className="text-2xl font-bold text-green-600 mt-1">+${potentialProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-gray-400 mt-1">From remaining inventory</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.656 2.25 2.25 0 0 0-.58 1.652c0 1.108.836 2.09 2.3 2.536l.196.06c1.125.344 1.62.906 1.62 1.48a1.144 1.144 0 0 1-1.06 1.164 1.95 1.95 0 0 1-1.638-.636.75.75 0 0 0-1.168.908 3.448 3.448 0 0 0 1.8.84V18a.75.75 0 0 0 1.5 0v-.815a3.836 3.836 0 0 0 1.72-.656 2.25 2.25 0 0 0 .58-1.652c0-1.108-.836-2.09-2.3-2.536l-.196-.06c-1.125-.344-1.62-.906-1.62-1.48a1.144 1.144 0 0 1 1.06-1.164 1.95 1.95 0 0 1 1.638.636.75.75 0 0 0 1.168-.908 3.448 3.448 0 0 0-1.8-.84V6Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Product Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-secondary">Product Performance Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margin/Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => {
                const margin = product.costPrice > 0 ? product.price - product.costPrice : product.price;
                const marginPercent = product.costPrice > 0 ? ((margin / product.price) * 100).toFixed(0) : 100;
                
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="font-medium text-secondary text-sm md:text-base">{product.name}</div>
                      <div className="text-[10px] md:text-xs text-gray-400 uppercase">{product.sub}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-mono text-gray-500 text-sm md:text-base">
                      ${(product.costPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-mono text-secondary text-sm md:text-base">
                      ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                      <span className="font-bold text-green-600 text-sm md:text-base">+${margin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-[10px] md:text-xs text-gray-400 ml-1 md:ml-2 block md:inline">({marginPercent}%)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
