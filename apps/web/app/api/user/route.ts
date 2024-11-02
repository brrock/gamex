import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    // Create the response first
    const response = new NextResponse(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );

    // Return the awaited response
    return await response;
  }

  return NextResponse.json({ userId });
}
