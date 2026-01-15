import dbConnect from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  await dbConnect();

  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    return Response.json({ success: true, data: categories });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const category = await Category.create(body);
    return Response.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return Response.json({ success: false, error: "Category already exists" }, { status: 400 });
    }
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
