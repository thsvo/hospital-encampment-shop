import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";

// Default vendor settings
const defaultVendor = {
  companyName: "BioVibe Peptides",
  streetAddress: "[Street Address]",
  cityStateZip: "[City, ST ZIP]",
  phone: "(000) 000-0000",
  fax: "(000) 000-0000",
  website: "biovibepeptides.com",
  email: "support@biovibepeptides.com",
  contactName: "[Contact Name]",
};

export async function GET() {
  await dbConnect();

  try {
    let settings = await Settings.findOne({ key: "vendor" });
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({ key: "vendor", value: defaultVendor });
    }
    return Response.json({ success: true, data: settings.value });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const settings = await Settings.findOneAndUpdate(
      { key: "vendor" },
      { value: body },
      { new: true, upsert: true }
    );
    return Response.json({ success: true, data: settings.value });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
