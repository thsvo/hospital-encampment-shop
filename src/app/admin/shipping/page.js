"use client";

import { useState, useEffect } from 'react';

export default function ShippingPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    deliveryTime: '',
    isActive: true
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const res = await fetch('/api/shipping');
      const data = await res.json();
      if (data.success) {
        setMethods(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch shipping methods', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = editingMethod 
      ? `/api/shipping/${editingMethod._id}` 
      : '/api/shipping';
    const method = editingMethod ? 'PATCH' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          deliveryTime: formData.deliveryTime,
          isActive: formData.isActive
        }),
      });
      const data = await res.json();
      if (data.success) {
        resetForm();
        fetchMethods();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to save shipping method');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this shipping method?')) return;
    
    try {
      const res = await fetch(`/api/shipping/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMethods(methods.filter(m => m._id !== id));
      }
    } catch (error) {
      alert('Failed to delete shipping method');
    }
  };

  const handleEdit = (method) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      price: method.price.toString(),
      deliveryTime: method.deliveryTime,
      isActive: method.isActive
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMethod(null);
    setFormData({ name: '', price: '', deliveryTime: '', isActive: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-secondary">Shipping Methods</h1>
          <p className="text-gray-500 mt-1">Manage delivery options and pricing</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Method
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading shipping methods...</div>
        ) : methods.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No shipping methods defined. Add your first one!</div>
        ) : (


          <>
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {methods.map((method) => (
                <div key={method._id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-secondary">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.deliveryTime}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      method.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="font-mono font-bold text-secondary">
                      ${method.price.toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(method)} 
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors border border-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(method._id)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Time</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {methods.map((method) => (
                    <tr key={method._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-secondary">{method.name}</td>
                      <td className="px-6 py-4 text-gray-500">{method.deliveryTime}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-secondary">${method.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          method.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {method.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(method)} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(method._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
          </>
        )}
      </div>


      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative bg-white p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-md">
            <button 
              onClick={resetForm}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-secondary mb-6">
              {editingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method Name</label>
                <input
                  type="text"
                  placeholder="e.g. Express Shipping"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="25.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Estimate</label>
                <input
                  type="text"
                  placeholder="e.g. 2-3 business days"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 select-none">
                  Active (visible to customers)
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="flex-1 py-2 px-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-2 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  {editingMethod ? 'Update Method' : 'Save Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
