import { NextResponse } from "next/server";
import { updateUserStatus } from "@/services/userService";
import type { UserStatus } from "@/types/auth";

const statuses: UserStatus[] = ["active", "inactive"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    const body = (await request.json()) as { status?: UserStatus };

    if (!body.status || !statuses.includes(body.status)) {
      return NextResponse.json(
        { message: "Select a valid status" },
        { status: 400 },
      );
    }

    const user = await updateUserStatus(userId, body.status);

    if (!user) {
      return NextResponse.json(
        { message: "Faculty user not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Admin faculty status update error", error);
    return NextResponse.json(
      { message: "Unable to update faculty status right now" },
      { status: 500 },
    );
  }
}
