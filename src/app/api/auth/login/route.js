import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request) {
  await dbConnect();

  try {
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Set a simple auth cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", "logged_in", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
