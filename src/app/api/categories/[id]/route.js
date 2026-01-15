import dbConnect from "@/lib/db";
import Category from "@/models/Category";

export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return Response.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: category });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PATCH(request, { params }) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();
    const category = await Category.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!category) {
      return Response.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return Response.json({ success: true, data: category });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
