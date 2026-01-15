import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { sendPaymentLinkEmail } from "@/lib/email";

export async function POST(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const { paymentLink } = await request.json();

    if (!paymentLink) {
      return Response.json({ success: false, error: "Payment link is required" }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Save the payment link to the order
    order.paymentLink = paymentLink;
    await order.save();

    // Send the email
    await sendPaymentLinkEmail(order, paymentLink);

    return Response.json({ success: true, message: "Payment link sent successfully" });
  } catch (error) {
    console.error("Error sending payment link:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
