import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { cookies } from "next/headers";

export async function GET() {
  await dbConnect();

  try {
    const products = await Product.find({}).sort({ order: 1, createdAt: -1 });
    return Response.json({ success: true, data: products });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}


export async function POST(request) {
  await dbConnect();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token");

    if (!token) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const product = await Product.create(body);
    return Response.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
