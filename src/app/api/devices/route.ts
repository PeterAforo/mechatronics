import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/devices - Get all devices for the current user
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDevices = await prisma.userDevice.findMany({
      where: { userId: session.user.id },
      include: {
        device: {
          include: {
            variables: true,
            readings: {
              orderBy: { timestamp: "desc" },
              take: 10,
            },
          },
        },
      },
    });

    const devices = userDevices.map((ud: { device: unknown }) => ud.device);

    return NextResponse.json({ devices });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
