import dbConnect from "@/lib/db";
import SiteContent from "@/models/SiteContent";

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();

  try {
    const content = await SiteContent.getContent();
    return Response.json({ success: true, data: content });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    // Find existing or create new
    let content = await SiteContent.findOne();
    if (content) {
      content = await SiteContent.findByIdAndUpdate(content._id, body, { new: true, runValidators: true });
    } else {
      content = await SiteContent.create(body);
    }
    
    return Response.json({ success: true, data: content });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
