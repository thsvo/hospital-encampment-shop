"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// Toast Component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

// Loading Spinner Component
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function OrderMemoPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resending, setResending] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [toast, setToast] = useState(null);
  const memoRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.data);
          setPaymentLink(data.data.paymentLink || "");
        }
      } catch (error) {
        console.error("Failed to fetch order", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  const handleDownloadPDF = async () => {
    if (!memoRef.current) return;
    
    setGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(memoRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter'
      });
      
      const imgWidth = 612; // Letter width in points
      const pageHeight = 792; // Letter height in points
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`BioVibe_Order_${order._id.slice(-6).toUpperCase()}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
      showToast("Failed to generate PDF: " + error.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleResendInvoice = async () => {
    if (!order || resending) return;
    
    setResending(true);
    try {
      const res = await fetch('/api/orders/resend-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Invoice sent successfully to ${order.email}`, 'success');
      } else {
        showToast('Failed to send invoice: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('Failed to send invoice: ' + error.message, 'error');
    } finally {
      setResending(false);
    }

  };



  const handleSendPaymentLink = async () => {
    if (!order || sendingLink) return;
    if (!paymentLink) {
      showToast('Please enter a payment link', 'error');
      return;
    }
    
    setSendingLink(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/send-payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentLink }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment link email sent to ${order.email}`, 'success');
      } else {
        showToast('Failed to send email: ' + data.error, 'error');
      }
    } catch (error) {
      showToast('Error sending email', 'error');
    } finally {
      setSendingLink(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!order) {
    return <div className="min-h-screen flex items-center justify-center">Order not found</div>;
  }

  const orderNumber = order._id.slice(-6).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
      
      <div className="min-h-screen bg-gray-200 p-4 lg:p-8">
        {/* Action Bar */}
        <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center flex-wrap gap-3">
          <Link href="/admin/orders" className="text-blue-600 hover:underline flex items-center gap-2">
            ← Back to Orders
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handleResendInvoice}
              disabled={resending}
              className="px-5 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px] justify-center"
            >
              {resending ? <><Spinner /> Sending...</> : '📧 Resend Invoice'}
            </button>
            <button
              onClick={() => window.open(`/print/order/${order._id}`, '_blank')}
              className="px-5 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Payment Link Section */}
        <div className="max-w-4xl mx-auto mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payment & Fulfillment</h3>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
             <div className="flex-grow w-full">
               <label className="block text-sm font-medium text-gray-700 mb-1">Payment Link</label>
               <input 
                 type="text" 
                 value={paymentLink}
                 onChange={(e) => setPaymentLink(e.target.value)}
                 placeholder="https://stripe.com/payment-link/..."
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>
             <div className="flex gap-2">
               <button 
                 onClick={handleSendPaymentLink}
                 disabled={sendingLink || !paymentLink}
                 className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
               >
                 {sendingLink ? 'Sending...' : '📨 Send Payment Email'}
               </button>
             </div>
          </div>
        </div>

        {/* Purchase Order Document */}
        <div className="w-full overflow-x-auto pb-6">
          <div ref={memoRef} className="purchase-order min-w-[800px] max-w-4xl mx-auto bg-white shadow-xl p-8" style={{ fontFamily: 'Arial, sans-serif' }}>
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              {/* Logo */}
              <div className="mb-2">
                <span className="font-serif text-2xl font-bold text-secondary">
                  BioVibe<span className="text-primary">.</span>
                </span>
              </div>
              <div className="text-gray-600 text-sm">
                <p className="font-bold text-teal-600">BioVibe Peptides</p>
                <p>support@biovibepeptides.com</p>
                <p>biovibepeptides.com</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-teal-600 italic mb-2">PURCHASE ORDER</h1>
              <table className="text-sm ml-auto">
                <tbody>
                  <tr>
                    <td className="text-gray-600 pr-4">DATE</td>
                    <td className="font-medium">{orderDate}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-600 pr-4">PO #</td>
                    <td className="font-medium">{orderNumber}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor & Ship To */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <div className="bg-teal-600 text-white px-3 py-1 font-bold text-sm mb-2">VENDOR</div>
              <div className="text-sm text-gray-600 border-l-2 border-teal-200 pl-3">
                <p className="font-medium">BioVibe Peptides</p>
                <p>support@biovibepeptides.com</p>
                <p>biovibepeptides.com</p>
              </div>
            </div>
            <div>
              <div className="bg-teal-600 text-white px-3 py-1 font-bold text-sm mb-2">SHIP TO</div>
              <div className="text-sm text-gray-600 border-l-2 border-teal-200 pl-3">
                <p className="font-medium">{order.title ? order.title + ' ' : ''}{order.firstName} {order.lastName}</p>
                <p>{order.email}</p>
                {order.phone && <p>{order.phone}</p>}
                {order.shippingAddress && (
                  <>
                    {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                    {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                    <p>
                      {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.zip].filter(Boolean).join(', ')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Requisitioner Row */}
          <div className="grid grid-cols-4 gap-0 mb-4">
            <div className="bg-teal-600 text-white px-3 py-2 font-bold text-xs">REQUISITIONER</div>
            <div className="bg-teal-600 text-white px-3 py-2 font-bold text-xs">SHIP VIA</div>
            <div className="bg-teal-600 text-white px-3 py-2 font-bold text-xs">F.O.B.</div>
            <div className="bg-teal-600 text-white px-3 py-2 font-bold text-xs">SHIPPING TERMS</div>
          </div>
          <div className="grid grid-cols-4 gap-0 mb-6 border border-gray-200">
            <div className="px-3 py-2 text-sm border-r border-gray-200">{order.firstName} {order.lastName}</div>
            <div className="px-3 py-2 text-sm border-r border-gray-200">{order.shippingOption || 'Standard'}</div>
            <div className="px-3 py-2 text-sm border-r border-gray-200">Destination</div>
            <div className="px-3 py-2 text-sm"></div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-3 py-2 text-left text-xs font-bold">ITEM #</th>
                <th className="px-3 py-2 text-left text-xs font-bold">DESCRIPTION</th>
                <th className="px-3 py-2 text-center text-xs font-bold">QTY</th>
                <th className="px-3 py-2 text-right text-xs font-bold">UNIT PRICE</th>
                <th className="px-3 py-2 text-right text-xs font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 bg-gradient-to-r from-orange-50/30 to-transparent">
                  <td className="px-3 py-3 text-sm">[{item.productId?.slice(-8) || (index + 1).toString().padStart(8, '0')}]</td>
                  <td className="px-3 py-3 text-sm font-medium">{item.name}</td>
                  <td className="px-3 py-3 text-sm text-center">{item.quantity}</td>
                  <td className="px-3 py-3 text-sm text-right">{(item.price / item.quantity).toFixed(2)}</td>
                  <td className="px-3 py-3 text-sm text-right font-medium">{item.price.toFixed(2)}</td>
                </tr>
              ))}
              {/* Empty rows for visual consistency */}
              {[...Array(Math.max(0, 5 - order.items.length))].map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-gray-200">
                  <td className="px-3 py-3 text-sm">&nbsp;</td>
                  <td className="px-3 py-3 text-sm"></td>
                  <td className="px-3 py-3 text-sm"></td>
                  <td className="px-3 py-3 text-sm"></td>
                  <td className="px-3 py-3 text-sm"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Comments & Totals */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="bg-teal-600 text-white px-3 py-1 font-bold text-xs mb-2">Comments or Special Instructions</div>
              <div className="border border-gray-200 p-3 min-h-[80px] text-sm text-gray-500">
                {order.notes || ''}
              </div>
            </div>
            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">SUBTOTAL</td>
                    <td className="py-2 text-right">${order.subtotal?.toFixed(2) || order.total?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">PROCESSING FEE (5%)</td>
                    <td className="py-2 text-right">${order.processingFee?.toFixed(2) || ((order.subtotal || 0) * 0.05).toFixed(2)}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium">SHIPPING</td>
                    <td className="py-2 text-right">${order.shippingCost?.toFixed(2) || '0.00'}</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="py-2 font-bold">TOTAL</td>
                    <td className="py-2 text-right font-bold text-teal-600">${order.total?.toFixed(2) || '0.00'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>If you have any questions about this purchase order, please contact</p>
            <p className="font-medium">support@biovibepeptides.com</p>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

