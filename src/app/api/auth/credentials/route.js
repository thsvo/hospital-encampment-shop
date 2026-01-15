import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Update admin credentials
export async function PUT(request) {
  await dbConnect();

  // Check if user is authenticated
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token || token.value !== "logged_in") {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newEmail, newPassword } = await request.json();

    // Find the current admin user (assume single admin for now)
    const user = await User.findOne({});
    if (!user) {
      return Response.json({ success: false, error: "No admin user found" }, { status: 404 });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return Response.json({ success: false, error: "Current password is incorrect" }, { status: 401 });
    }

    // Update email if provided
    if (newEmail && newEmail !== user.email) {
      user.email = newEmail;
    }

    // Update password if provided
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    return Response.json({ success: true, message: "Credentials updated successfully" });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Get current admin email (for display in settings)
export async function GET() {
  await dbConnect();

  // Check if user is authenticated
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  if (!token || token.value !== "logged_in") {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await User.findOne({}).select("email");
    if (!user) {
      return Response.json({ success: false, error: "No admin user found" }, { status: 404 });
    }

    return Response.json({ success: true, data: { email: user.email } });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
