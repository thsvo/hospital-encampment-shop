import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp0001.neo.space",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOrderConfirmation(order) {
  const itemsHtml = order.items.map(item => 
    `<tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
    </tr>`
  ).join('');

  const shippingAddress = order.shippingAddress || {};
  const addressParts = [
    shippingAddress.street,
    shippingAddress.street2,
    [shippingAddress.city, shippingAddress.state, shippingAddress.zip].filter(Boolean).join(', ')
  ].filter(Boolean);

  const processingFee = order.processingFee || (order.subtotal * 0.05);
  const shippingCost = order.shippingCost || 0;

  const mailOptions = {
    from: `"BioVibe Peptides" <support@biovibepeptides.com>`,
    replyTo: 'support@biovibepeptides.com',
    to: order.email,
    subject: `Order Invoice #${order._id?.toString().slice(-8).toUpperCase() || 'PENDING'} - BioVibe Peptides`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <!-- Header -->
        <div style="background: #0B2E27; padding: 30px; text-align: center;">
          <h1 style="color: #41DAC1; margin: 0; font-size: 28px;">BioVibe Peptides</h1>
          <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Private Secure Order Invoice</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #0B2E27; margin: 0 0 20px 0;">Thank you for your order!</h2>
          <p style="color: #666; margin: 0 0 25px 0;">Your order has been received. Our team will reach out shortly to collect payment.</p>
          
          <!-- Customer Info -->
          <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 15px 0; color: #0B2E27; font-size: 16px;">Customer Information</h3>
            <table style="width: 100%; font-size: 14px;">
              <tr>
                <td style="padding: 4px 0; color: #666; width: 50%;">
                  Practice Name: <br>
                  <span style="color: #0B2E27; font-weight: 500;">${order.practiceName || 'N/A'}</span>
                </td>
                <td style="padding: 4px 0; color: #666; width: 50%;">
                  Medical Provider/Director: <br>
                  <span style="color: #0B2E27; font-weight: 500;">${order.title ? order.title : ''} ${order.firstName} ${order.lastName}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;">Email:</td>
                <td style="padding: 4px 0; color: #0B2E27;">${order.email}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #666;">Phone:</td>
                <td style="padding: 4px 0; color: #0B2E27;">${order.phone || 'Not provided'}</td>
              </tr>
              ${addressParts.length > 0 ? `
              <tr>
                <td style="padding: 4px 0; color: #666; vertical-align: top;">Shipping:</td>
                <td style="padding: 4px 0; color: #0B2E27;">${addressParts.join('<br>')}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <!-- Order Items -->
          <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 15px 0; color: #0B2E27; font-size: 16px;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 12px 8px; text-align: left; font-size: 13px; color: #666;">Product</th>
                  <th style="padding: 12px 8px; text-align: center; font-size: 13px; color: #666;">Qty</th>
                  <th style="padding: 12px 8px; text-align: right; font-size: 13px; color: #666;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <!-- Totals -->
            <div style="border-top: 2px solid #e5e7eb; margin-top: 15px; padding-top: 15px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 4px 12px 4px 0; color: #666;">Subtotal:</td>
                  <td style="padding: 4px 0; text-align: right; white-space: nowrap;">$${order.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 12px 4px 0; color: #666;">Processing Fee (5%):</td>
                  <td style="padding: 4px 0; text-align: right; white-space: nowrap;">$${processingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                ${shippingCost > 0 ? `
                <tr>
                  <td style="padding: 4px 12px 4px 0; color: #666; vertical-align: top;">
                    Shipping:
                    ${order.shippingOption ? `<br><span style="font-size: 12px; color: #888; font-weight: normal;">${order.shippingOption}</span>` : ''}
                  </td>
                  <td style="padding: 4px 0; text-align: right; vertical-align: top; white-space: nowrap;">$${shippingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                ` : ''}
                <tr style="font-size: 18px; font-weight: bold;">
                  <td style="padding: 12px 12px 0 0; color: #0B2E27;">Total:</td>
                  <td style="padding: 12px 0 0 0; text-align: right; color: #41DAC1; white-space: nowrap;">$${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </table>
            </div>
          </div>
          
          <!-- Notes -->
          ${order.notes ? `
          <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
            <h3 style="margin: 0 0 10px 0; color: #0B2E27; font-size: 16px;">Order Notes</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">${order.notes}</p>
          </div>
          ` : ''}
          
          <!-- Disclaimer -->
          <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 1px solid #fcd34d;">
            <p style="margin: 0; color: #92400e; font-size: 12px;">
              <strong>⚠️ Disclaimer:</strong> Peptides are NOT FDA approved. They should be used under the guidance of a medical provider.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; margin: 0;">
            If you have any questions, please contact us at <a href="mailto:support@biovibepeptides.com" style="color: #41DAC1;">support@biovibepeptides.com</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #0B2E27; padding: 20px; text-align: center;">
          <p style="color: #888; margin: 0; font-size: 12px;">© 2024 BioVibe Peptides. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendInvoiceWithPDF(order, pdfBuffer) {
  const orderNumber = order._id?.toString().slice(-8).toUpperCase() || 'PENDING';
  
  const mailOptions = {
    from: `"BioVibe Peptides" <support@biovibepeptides.com>`,
    replyTo: 'support@biovibepeptides.com',
    to: order.email,
    subject: `Invoice #${orderNumber} - BioVibe Peptides (Resent)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: #0B2E27; padding: 30px; text-align: center;">
          <h1 style="color: #41DAC1; margin: 0; font-size: 28px;">BioVibe Peptides</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #0B2E27; margin: 0 0 20px 0;">Your Invoice</h2>
          <p style="color: #666; margin: 0 0 25px 0;">
            As requested, please find your invoice attached as a PDF document.
          </p>
          <p style="color: #666; margin: 0 0 15px 0;">
            <strong>Invoice #:</strong> ${orderNumber}<br>
            <strong>Total:</strong> $${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
            If you have any questions, please contact us at 
            <a href="mailto:support@biovibepeptides.com" style="color: #41DAC1;">support@biovibepeptides.com</a>
          </p>
        </div>
        <div style="background: #0B2E27; padding: 20px; text-align: center;">
          <p style="color: #888; margin: 0; font-size: 12px;">© 2024 BioVibe Peptides. All rights reserved.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `BioVibe_Invoice_${orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  return transporter.sendMail(mailOptions);
}

export async function sendAdminOrderAlert(order) {
  const itemsHtml = order.items.map(item => 
    `<li>${item.quantity}x ${item.name} ($${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</li>`
  ).join('');

  const mailOptions = {
    from: `"BioVibe Peptides System" <support@biovibepeptides.com>`,
    to: 'support@biovibepeptides.com',
    subject: `🚨 New Order Alert! #${order._id.toString().slice(-8).toUpperCase()} - $${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #0B2E27;">New Order Received</h2>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Customer:</strong> ${order.firstName} ${order.lastName}</p>
        <p><strong>Practice:</strong> ${order.practiceName || 'N/A'}</p>
        <p><strong>Total:</strong> $${order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        
        <h3>Items:</h3>
        <ul>${itemsHtml}</ul>
        
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.biovibepeptides.com'}/admin/orders" style="display: inline-block; background: #0B2E27; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order in Admin</a></p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Admin alert sent');
  } catch (error) {
    console.error('Failed to send admin alert:', error);
  }
}

export async function sendPaymentLinkEmail(order, paymentLink) {
  const mailOptions = {
    from: `"BioVibe Peptides" <support@biovibepeptides.com>`,
    to: order.email,
    replyTo: 'support@biovibepeptides.com',
    subject: `Payment Link for Your Order`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <p>Dear ${order.firstName} ${order.lastName},</p>
        
        <p>Thank you for choosing BioVibe Peptides. Please use the payment link below to complete the payment for your order:</p>
        
        <p style="margin: 20px 0;">
          <a href="${paymentLink}" style="background-color: #0B2E27; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a>
        </p>
        
        <p>Or copy and paste this link into your browser:<br>
        <a href="${paymentLink}">${paymentLink}</a></p>
        
        <p>If you encounter any issues, or if you need an alternative payment method, feel free to reply to this email and we’ll assist you promptly. Once payment is received, we’ll update you with a confirmation and your order timeline.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Tips:</strong>
          <ul style="margin: 5px 0 0 0; padding-left: 20px;">
            <li>The link is secure and easy to use.</li>
            <li>You can review the order details before paying.</li>
          </ul>
        </div>
        
        <p>Thank you for your business!</p>
        
        <p>Best regards,<br>
        <strong>BioVibe Peptides</strong><br>
        <a href="https://www.biovibepeptides.com">www.biovibepeptides.com</a></p>
        
        <div style="font-family: serif; font-size: 24px; font-weight: bold; color: #0B2E27; margin-top: 20px;">
          BioVibe<span style="color: #41DAC1;">.</span>
        </div>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
}
