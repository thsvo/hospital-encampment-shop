import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";

export async function PATCH(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const body = await request.json();
    const method = await ShippingMethod.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!method) {
      return Response.json({ success: false, error: "Method not found" }, { status: 404 });
    }
    
    return Response.json({ success: true, data: method });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const deletedMethod = await ShippingMethod.deleteOne({ _id: id });
    
    if (!deletedMethod) {
      return Response.json({ success: false, error: "Method not found" }, { status: 404 });
    }
    
    return Response.json({ success: true, data: {} });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
