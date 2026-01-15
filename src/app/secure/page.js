"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const shippingOptions = []; // Will be fetched from API

export default function SecurePage() {
  const [products, setProducts] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]); // Dynamic methods
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1 = products, 2 = checkout
  const [processingFee, setProcessingFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [siteContent, setSiteContent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    firstName: '',
    lastName: '',
    title: '',
    practiceName: '',
    email: '',
    emailConfirmation: '',
    phone: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    shippingOption: '', // Will default to first available
    notes: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const fetchProducts = async () => {
    try {
      const prodRes = await fetch('/api/products', { cache: 'no-store' });
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchShippingMethods = async () => {
    try {
      const shipRes = await fetch('/api/shipping', { cache: 'no-store' });
      const shipData = await shipRes.json();
      if (shipData.success) {
        const activeMethods = shipData.data.filter(m => m.isActive);
        setShippingMethods(activeMethods);
        // Set default shipping option
        if (activeMethods.length > 0) {
          setFormData(prev => ({ ...prev, shippingOption: activeMethods[0]._id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch shipping methods", error);
    }
  };

  const fetchSiteContent = async () => {
    try {
      const res = await fetch("/api/site-content", { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setSiteContent(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch site content", error);
    }
  };

  useEffect(() => {
    async function fetchData() {
      await Promise.all([
        fetchProducts(),
        fetchShippingMethods(),
        fetchSiteContent()
      ]);
      setLoading(false);
    }
    fetchData();
  }, []);

  const updateQuantity = (id, value) => {
    const val = parseInt(value) || 0;
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const increment = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const decrement = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
  };

  const subtotal = products.reduce((acc, product) => {
    return acc + product.price * (quantities[product._id] || 0);
  }, 0);

  const selectedItems = products.filter(p => (quantities[p._id] || 0) > 0);
  
  // Find selected method details
  const selectedMethod = shippingMethods.find(m => m._id === formData.shippingOption);
  const shippingCost = selectedMethod ? selectedMethod.price : 0;

  useEffect(() => {
    const fee = subtotal * 0.05;
    setProcessingFee(fee);
    setTotal(subtotal + shippingCost + fee);
  }, [subtotal, shippingCost]);

  // Filter products by search query
  useEffect(() => {
    setFilteredProducts(products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [products, searchQuery]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Validate email confirmation
    if (formData.email !== formData.emailConfirmation) {
      alert('Email addresses do not match. Please confirm your email.');
      return;
    }

    if (!agreedToTerms) {
      alert('You must agree to the Terms and Conditions to place an order.');
      return;
    }
    
    setSubmitting(true);

    const items = selectedItems.map(product => ({
      productId: product._id,
      name: product.name,
      quantity: quantities[product._id],
      price: product.price * quantities[product._id],
    }));

    const orderData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      title: formData.title,
      practiceName: formData.practiceName,
      email: formData.email,
      phone: formData.phone,
      shippingAddress: {
        street: formData.street,
        street2: formData.street2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
      shippingOption: formData.shippingOption,
      shippingCost: shippingCost,
      processingFee: processingFee,
      items,
      subtotal,
      total,
      notes: formData.notes,
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        setOrderSuccess(true);
        setQuantities({});
        setFormData({
          firstName: '', lastName: '', title: '', email: '', emailConfirmation: '', phone: '',
          street: '', street2: '', city: '', state: '', zip: '',
          shippingOption: 'standard', notes: '',
        });
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-secondary">Loading...</div>;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-2">Order Submitted!</h2>
          <p className="text-gray-500 mb-6">We'll send a payment link to your email shortly.</p>
          <Link href="/" className="px-6 py-3 bg-primary text-white rounded-xl font-medium inline-block">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-secondary font-sans">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold flex items-center gap-2">
            <span className="text-primary">●</span> BioVibe
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className={`flex items-center gap-2 ${step === 1 ? 'text-primary font-medium' : 'text-gray-400'}`}>
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</span>
              Products
            </span>
            <span className="text-gray-300">→</span>
            <span className={`flex items-center gap-2 ${step === 2 ? 'text-primary font-medium' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
              Checkout
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {step === 1 ? (
          <>
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold mb-2">{siteContent?.securePageTitle || "BioVibe Private Secure Order Form"}</h1>
              <p className="text-gray-600 mb-4">
                {siteContent?.securePageDescription || "Please fill the correct quantities of items you need and submit your order. Once your form has been submitted, you will receive an email with a copy of the order and our team will reach out to collect payment."}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                {siteContent?.securePageContactText || "If you have any questions, contact us at"} <a href={`mailto:${siteContent?.contactEmail || "support@biovibepeptides.com"}`} className="text-primary hover:underline">{siteContent?.contactEmail || "support@biovibepeptides.com"}</a>.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-4">
                <p className="text-yellow-800 text-sm font-medium">
                  {siteContent?.securePageDisclaimer || "⚠️ Disclaimer: Peptides are NOT FDA approved. It should be used under the guidance of a medical provider."}
                </p>
                <p className="text-yellow-700 text-sm mt-2">
                  {siteContent?.securePageFeeText || "A standard 5% processing fee is added to each order to ensure secure processing and fulfillment."}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <input 
                type="text"
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {filteredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className={`bg-white rounded-2xl p-4 border-2 transition-all ${
                    (quantities[product._id] || 0) > 0 
                      ? 'border-primary shadow-lg' 
                      : 'border-transparent shadow-sm hover:shadow-md'
                  } ${product.stockQuantity <= 0 ? 'opacity-60 grayscale pointer-events-none' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight">{product.name}</h3>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 uppercase truncate">{product.sub}</span>
                        {product.stockQuantity <= 0 ? (
                          <span className="text-xs font-bold text-red-500 mt-1">Out of Stock</span>
                        ) : product.stockQuantity <= (product.lowStockThreshold || 5) ? (
                          <span className="text-xs font-bold text-yellow-600 mt-1">Only {product.stockQuantity} Left</span>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary ml-2">${product.price?.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => decrement(product._id)} 
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                      disabled={!quantities[product._id]}
                    >
                      −
                    </button>
                    <input 
                      type="number" 
                      min="0"
                      max={product.stockQuantity}
                      value={quantities[product._id] || 0}
                      onChange={(e) => updateQuantity(product._id, Math.min(parseInt(e.target.value) || 0, product.stockQuantity))}
                      className="flex-1 h-9 text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-sm"
                    />
                    <button 
                      onClick={() => increment(product._id)} 
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={(quantities[product._id] || 0) >= product.stockQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Button */}
            {subtotal > 0 && (
              <div className="sticky bottom-0 bg-white border-t border-gray-100 -mx-6 px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Subtotal</p>
                  <p className="text-2xl font-bold">${subtotal.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                >
                  Continue to Checkout →
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Checkout Form */}
            <button onClick={() => setStep(1)} className="text-primary hover:underline mb-6 flex items-center gap-2">
              ← Back to Products
            </button>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                  {/* Contact Information */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm">1</span>
                      Contact Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input type="text" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input type="text" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Practice Name *</label>
                        <input type="text" required value={formData.practiceName} onChange={(e) => setFormData({...formData, practiceName: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medical Provider/Director Name and Title *</label>
                        <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                          placeholder="e.g., Dr. John Doe, MD"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Confirmation *</label>
                        <input type="email" required value={formData.emailConfirmation} onChange={(e) => setFormData({...formData, emailConfirmation: e.target.value})}
                          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                            formData.emailConfirmation && formData.email !== formData.emailConfirmation 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-gray-200'
                          }`} />
                        {formData.emailConfirmation && formData.email !== formData.emailConfirmation && (
                          <p className="text-red-500 text-xs mt-1">Emails do not match</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm">2</span>
                      Shipping Address
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                        <input type="text" required value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apt, Suite, etc. (Optional)</label>
                        <input type="text" value={formData.street2} onChange={(e) => setFormData({...formData, street2: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                          <input type="text" required value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Options */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-sm">3</span>
                      Shipping Method
                    </h2>
                    <div className="space-y-3">
                      {shippingMethods.map((option) => (
                        <label key={option._id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.shippingOption === option._id ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input type="radio" name="shipping" value={option._id} checked={formData.shippingOption === option._id}
                              onChange={(e) => setFormData({...formData, shippingOption: e.target.value})}
                              className="w-4 h-4 text-primary" />
                            <div className="flex flex-col">
                              <span className="font-medium">{option.name}</span>
                              <span className="text-xs text-gray-400">{option.deliveryTime}</span>
                            </div>
                          </div>
                          <span className="font-bold">+${option.price.toFixed(2)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Order Notes (Optional)</h2>
                    <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any special instructions..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="flex items-start gap-3 p-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms and Conditions</Link> & <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>, and understand that these products are for research or professional use only.
                    </label>
                  </div>

                  {/* Submit - Mobile */}
                  <button type="submit" disabled={submitting} className="lg:hidden w-full py-4 bg-secondary text-white rounded-xl font-bold text-lg disabled:opacity-50">
                    {submitting ? 'Processing...' : `Submit Order • $${total.toFixed(2)}`}
                  </button>
                </form>
              </div>

              {/* Order Summary - Desktop */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-4">
                    {selectedItems.map((item) => (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span>{item.name} × {quantities[item._id]}</span>
                        <span className="font-medium">${(item.price * quantities[item._id]).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Processing Fee (5%)</span>
                      <span>${processingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={handleSubmitOrder} disabled={submitting}
                    className="w-full mt-6 py-4 bg-secondary text-white rounded-xl font-bold text-lg disabled:opacity-50 hover:bg-secondary/90 transition-colors">
                    {submitting ? 'Processing...' : 'Submit Order'}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-3">You'll receive a payment link via email</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
