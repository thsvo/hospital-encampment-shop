import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { sendOrderConfirmation, sendAdminOrderAlert } from "@/lib/email";

import ShippingMethod from "@/models/ShippingMethod";

export async function GET() {
  await dbConnect();

  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return Response.json({ success: true, data: orders });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // Resolve shipping method name if it's an ID
    if (body.shippingOption && body.shippingOption.length === 24) {
      try {
        const method = await ShippingMethod.findById(body.shippingOption);
        if (method) {
          body.shippingOption = method.name;
        }
      } catch (e) {
        // Fallback or ignore if invalid ID
        console.warn("Could not resolve shipping method ID:", body.shippingOption);
      }
    }

    const order = await Order.create(body);
    
    // Auto-deduct stock for each item in the order
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stockQuantity: -item.quantity }
        });
      }
    }
    
    // Send confirmation email and admin alert
    try {
      await sendOrderConfirmation(order);
      // Send admin alert asynchronously (don't await to avoid blocking response if it fails)
      sendAdminOrderAlert(order).catch(err => console.error("Admin alert failed:", err));
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the order if email fails
    }

    return Response.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

