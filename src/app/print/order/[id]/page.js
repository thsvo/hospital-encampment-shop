"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function OrderPrintPage() {
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(`/api/orders/${params.id}`),
          fetch('/api/settings')
        ]);
        
        const orderData = await orderRes.json();
        const settingsData = await settingsRes.json();
        
        if (orderData.success) {
          setOrder(orderData.data);
        }
        if (settingsData.success) {
          setVendor(settingsData.data);
        }
        
        // Auto print after load
        setTimeout(() => window.print(), 500);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return <div className="p-8 font-sans">Loading...</div>;
  }

  if (!order) {
    return <div className="p-8 font-sans">Order not found</div>;
  }

  const orderNumber = order._id.slice(-6).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');

  // Default vendor if not loaded
  const v = vendor || {
    companyName: "BioVibe Peptides",
    streetAddress: "[Street Address]",
    cityStateZip: "[City, ST ZIP]",
    phone: "(000) 000-0000",
    fax: "(000) 000-0000",
    website: "biovibepeptides.com",
    email: "support@biovibepeptides.com",
    contactName: "[Contact Name]",
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page { margin: 0.5in; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Hide any potential layout headers/sidebars if they leak in */
          nav, aside, header { display: none !important; }
        }
        .print-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background: white; }
        .header { display: flex; justify-content: space-between; margin-bottom: 24px; }
        .logo { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .logo-icon { width: 40px; height: 40px; background: #f97316; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .logo-text { color: #2563eb; font-weight: bold; font-size: 18px; }
        .company-info { color: #666; font-size: 12px; line-height: 1.5; }
        .company-name { color: #2563eb; font-weight: bold; }
        .title { text-align: right; }
        .title h1 { color: #2563eb; font-size: 28px; font-style: italic; margin-bottom: 8px; }
        .title table { margin-left: auto; font-size: 12px; }
        .title td { padding: 2px 0; }
        .title td:first-child { color: #666; padding-right: 16px; }
        .section-header { background: #2563eb; color: white; padding: 4px 12px; font-weight: bold; font-size: 12px; margin-bottom: 8px; }
        .section-content { font-size: 12px; color: #666; border-left: 2px solid #bfdbfe; padding-left: 12px; line-height: 1.6; margin-bottom: 16px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
        .shipping-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; margin-bottom: 16px; }
        .shipping-row .section-header { margin-bottom: 0; }
        .shipping-row-data { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border: 1px solid #e5e7eb; margin-bottom: 24px; }
        .shipping-row-data div { padding: 8px 12px; font-size: 12px; border-right: 1px solid #e5e7eb; }
        .shipping-row-data div:last-child { border-right: none; }
        table.items { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        table.items th { background: #2563eb; color: white; padding: 8px 12px; font-size: 11px; text-align: left; }
        table.items th:nth-child(3) { text-align: center; }
        table.items th:nth-child(4), table.items th:nth-child(5) { text-align: right; }
        table.items td { padding: 12px; font-size: 12px; border-bottom: 1px solid #e5e7eb; }
        table.items td:nth-child(3) { text-align: center; }
        table.items td:nth-child(4), table.items td:nth-child(5) { text-align: right; }
        .bottom-section { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .comments .section-header { margin-bottom: 8px; }
        .comments-box { border: 1px solid #e5e7eb; min-height: 80px; padding: 12px; }
        .totals { font-size: 12px; }
        .totals tr { border-bottom: 1px solid #e5e7eb; }
        .totals td { padding: 8px 0; }
        .totals td:last-child { text-align: right; }
        .totals tr.total-row { background: #f3f4f6; }
        .totals tr.total-row td { font-weight: bold; }
        .totals tr.total-row td:last-child { color: #2563eb; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #666; }
      `}</style>
      
      <div className="print-container">
        <div className="header">
          <div>
            <div className="logo">
              <div className="logo-icon">B</div>
              <span className="logo-text">BioVibe</span>
            </div>
            <div className="company-info">
              <p className="company-name">{v.companyName}</p>
              <p>{v.streetAddress}</p>
              <p>{v.cityStateZip}</p>
              <p>Phone: {v.phone}</p>
              <p>Fax: {v.fax}</p>
              <p>Website: {v.website}</p>
            </div>
          </div>
          <div className="title">
            <h1>PURCHASE ORDER</h1>
            <table>
              <tbody>
                <tr><td>DATE</td><td>{orderDate}</td></tr>
                <tr><td>PO #</td><td></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid">
          <div>
            <div className="section-header">VENDOR</div>
            <div className="section-content">
              <p>{v.companyName}</p>
              <p>{v.contactName}</p>
              <p>{v.streetAddress}</p>
              <p>{v.cityStateZip}</p>
              <p>Phone: {v.phone}</p>
            </div>
          </div>
          <div>
            <div className="section-header">SHIP TO</div>
            <div className="section-content">
              <p style={{ fontWeight: 500 }}>{order.firstName} {order.lastName}</p>
              <p>{order.shippingAddress?.street || ''}</p>
              {order.shippingAddress?.street2 && <p>{order.shippingAddress.street2}</p>}
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
              <p>Phone: {order.phone}</p>
              <p>Email: {order.email}</p>
            </div>
          </div>
        </div>

        <div className="shipping-row">
          <div className="section-header">REQUISITIONER</div>
          <div className="section-header">SHIP VIA</div>
          <div className="section-header">F.O.B.</div>
          <div className="section-header">SHIPPING TERMS</div>
        </div>
        <div className="shipping-row-data">
          <div>{order.firstName} {order.lastName}</div>
          <div>{order.shippingOption || 'Standard'}</div>
          <div></div>
          <div></div>
        </div>

        <table className="items">
          <thead>
            <tr>
              <th>ITEM #</th>
              <th>DESCRIPTION</th>
              <th>QTY</th>
              <th>UNIT PRICE</th>
              <th>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td>[{(index + 1).toString().padStart(8, '0')}]</td>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{(item.price / item.quantity).toFixed(2)}</td>
                <td style={{ fontWeight: 500 }}>{item.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bottom-section">
          <div className="comments">
            <div className="section-header">Comments or Special Instructions</div>
            <div className="comments-box">{order.notes || ''}</div>
          </div>
          <div>
            <table className="totals" style={{ width: '100%' }}>
              <tbody>
                <tr><td>SUBTOTAL</td><td>{(order.subtotal || order.total - (order.shippingCost || 0)).toFixed(2)}</td></tr>
                <tr><td>TAX</td><td></td></tr>
                <tr><td>SHIPPING</td><td>{(order.shippingCost || 0).toFixed(2)}</td></tr>
                <tr><td>OTHER</td><td></td></tr>
                <tr className="total-row"><td>TOTAL</td><td>$ {order.total.toFixed(2)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="footer">
          <p>If you have any questions about this purchase order, please contact</p>
          <p>{v.contactName}, {v.phone}, {v.email}</p>
        </div>
      </div>
    </>
  );
}
