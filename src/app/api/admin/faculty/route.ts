import { NextResponse } from "next/server";
import { getAdminFacultyUsers } from "@/services/userService";

export async function GET() {
  try {
    const faculty = await getAdminFacultyUsers();

    return NextResponse.json({ faculty });
  } catch (error) {
    console.error("Admin faculty list error", error);
    return NextResponse.json(
      { message: "Unable to load faculty users right now" },
      { status: 500 },
    );
  }
}
