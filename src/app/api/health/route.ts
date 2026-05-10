import { NextResponse } from "next/server";
import { jenkinsClient } from "@/lib/jenkins/client";

export async function GET() {
  try {
    const info = await jenkinsClient.getServerInfo();
    return NextResponse.json({
      status: "ok",
      jenkins: {
        connected: true,
        nodeName: info.nodeName ?? "master",
        mode: info.mode ?? "unknown",
        numExecutors: info.numExecutors ?? 0,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", jenkins: { connected: false }, error: message },
      { status: 503 }
    );
  }
}
