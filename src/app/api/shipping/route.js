import dbConnect from "@/lib/db";
import ShippingMethod from "@/models/ShippingMethod";

export async function GET() {
  await dbConnect();

  try {
    const methods = await ShippingMethod.find({}).sort({ price: 1 });
    return Response.json({ success: true, data: methods });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const method = await ShippingMethod.create(body);
    return Response.json({ success: true, data: method }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
