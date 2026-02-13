import { NextResponse } from "next/server";
import { dashboardService } from "@/lib/services/dashboard.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await dashboardService.getTodaySnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("Failed to get dashboard data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
