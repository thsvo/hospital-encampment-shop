import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { sendInvoiceWithPDF } from "@/lib/email";

export async function POST(request) {
  await dbConnect();

  try {
    const { orderId } = await request.json();
    
    if (!orderId) {
      return Response.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    // Fetch the order
    const order = await Order.findById(orderId);
    if (!order) {
      return Response.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Dynamic import jsPDF for server-side usage
    const { jsPDF } = await import('jspdf');

    // Generate PDF
    const pdfBuffer = generateInvoicePDF(order, jsPDF);

    // Send email with PDF attachment
    await sendInvoiceWithPDF(order, pdfBuffer);

    return Response.json({ success: true, message: "Invoice sent successfully" });
  } catch (error) {
    console.error("Failed to resend invoice:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

function generateInvoicePDF(order, jsPDF) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = 612;
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);
  let y = 40;

  // Colors
  const primaryColor = [11, 46, 39]; // #0B2E27
  const accentColor = [65, 218, 193]; // #41DAC1

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BioVibe Peptides', pageWidth / 2, 35, { align: 'center' });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Private Secure Order Invoice', pageWidth / 2, 55, { align: 'center' });

  y = 100;

  // Order Info Box
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y, contentWidth, 50, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text('Invoice #:', margin + 15, y + 20);
  doc.text('Date:', margin + 15, y + 35);
  
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text(orderNumber, margin + 70, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(orderDate, margin + 70, y + 35);

  y += 70;

  // Customer Information
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', margin + 10, y + 17);
  
  y += 35;
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Column 1
  doc.text(`Practice Name: ${order.practiceName || 'N/A'}`, margin + 10, y);
  y += 15;
  const customerName = `${order.firstName} ${order.lastName}`;
  doc.text(`Name: ${customerName}`, margin + 10, y);
  
  // Column 2 (Side by side)
  doc.text(`Email: ${order.email}`, margin + 300, y);
  
  y += 15;
  doc.text(`Phone: ${order.phone || 'Not provided'}`, margin + 10, y);
  
  if (order.shippingAddress) {
    y += 15;
    const addr = order.shippingAddress;
    const addressLine = [addr.street, addr.street2, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
    if (addressLine) {
      doc.text(`Shipping: ${addressLine}`, margin + 10, y);
    }
  }

  y += 30;

  // Order Items Table Header
  doc.setFillColor(...primaryColor);
  doc.rect(margin, y, contentWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Product', margin + 10, y + 17);
  doc.text('Qty', margin + 350, y + 17, { align: 'center' });
  doc.text('Price', margin + contentWidth - 10, y + 17, { align: 'right' });

  y += 30;

  // Order Items
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  
  order.items.forEach((item) => {
    // Alternate row background
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, y - 5, contentWidth, 20, 'F');
    
    doc.text(item.name, margin + 10, y + 8);
    doc.text(item.quantity.toString(), margin + 350, y + 8, { align: 'center' });
    doc.text(`$${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth - 10, y + 8, { align: 'right' });
    y += 20;
  });

  y += 15;

  // Totals
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 300, y, margin + contentWidth, y);
  y += 20;

  const processingFee = order.processingFee || (order.subtotal * 0.05);
  const shippingCost = order.shippingCost || 0;

  doc.setTextColor(100, 100, 100);
  doc.text('Subtotal:', margin + 350, y);
  doc.setTextColor(60, 60, 60);
  doc.text(`$${order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth - 10, y, { align: 'right' });
  y += 18;

  doc.setTextColor(100, 100, 100);
  doc.text('Processing Fee (5%):', margin + 350, y);
  doc.setTextColor(60, 60, 60);
  doc.text(`$${processingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth - 10, y, { align: 'right' });
  y += 18;

  if (shippingCost > 0) {
    doc.setTextColor(100, 100, 100);
    doc.text(`Shipping${order.shippingOption ? ' (' + order.shippingOption + ')' : ''}:`, margin + 350, y);
    doc.setTextColor(60, 60, 60);
    doc.text(`$${shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth - 10, y, { align: 'right' });
    y += 18;
  }

  // Total
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 300, y, margin + contentWidth, y);
  y += 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Total:', margin + 350, y);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`$${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + contentWidth - 10, y, { align: 'right' });

  y += 40;

  // Disclaimer
  doc.setFillColor(254, 243, 199);
  doc.rect(margin, y, contentWidth, 40, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Disclaimer: Peptides are NOT FDA approved. They should be used under the', margin + 10, y + 15);
  doc.text('guidance of a medical provider.', margin + 10, y + 28);

  y += 55;

  // Contact
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text('Questions? Contact us at support@biovibepeptides.com', pageWidth / 2, y, { align: 'center' });

  // Footer
  const footerY = 750;
  doc.setFillColor(...primaryColor);
  doc.rect(0, footerY, pageWidth, 42, 'F');
  doc.setTextColor(136, 136, 136);
  doc.setFontSize(9);
  doc.text('© 2024 BioVibe Peptides. All rights reserved.', pageWidth / 2, footerY + 25, { align: 'center' });

  // Return as buffer
  return Buffer.from(doc.output('arraybuffer'));
}
