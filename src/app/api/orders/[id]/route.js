import dbConnect from "@/lib/db";
import Order from "@/models/Order";

export async function GET(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const order = await Order.findById(id);
    if (!order) {
      return Response.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: order });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();
    const order = await Order.findByIdAndUpdate(id, body, { new: true });
    if (!order) {
      return Response.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: order });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      return Response.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: {} });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

