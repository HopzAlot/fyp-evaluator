import { NextResponse } from "next/server";
import { getFacultyProfilesByUserIds } from "@/services/facultyService";
import { getFacultyUsers } from "@/services/userService";

export async function GET() {
  try {
    const users = await getFacultyUsers();
    const profiles = await getFacultyProfilesByUserIds(
      users.map((user) => user._id),
    );
    const profileByUserId = new Map(
      profiles.map((profile) => [profile.userId.toString(), profile]),
    );

    const faculty = users.map((user) => {
      const profile = profileByUserId.get(user._id.toString());

      return {
        id: user._id.toString(),
        email: user.email,
        status: user.status,
        fullName: profile?.fullName,
        contactNumber: profile?.contactNumber,
        department: profile?.department,
        designation: profile?.designation,
        gender: profile?.gender,
      };
    });

    return NextResponse.json({ faculty });
  } catch (error) {
    console.error("Admin faculty list error", error);
    return NextResponse.json(
      { message: "Unable to load faculty users right now" },
      { status: 500 },
    );
  }
}
