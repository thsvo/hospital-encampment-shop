import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: product });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: product });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return Response.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: {} });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
