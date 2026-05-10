import { NextResponse } from "next/server";
import { jenkinsClient } from "@/lib/jenkins/client";
import { toProjectStatus } from "@/lib/jenkins/parser";
import type { ProjectStatus } from "@/types/jenkins";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await jenkinsClient.getJobs();

    const projects: ProjectStatus[] = await Promise.all(
      jobs.map(async (job) => {
        const build = await jenkinsClient.getLastBuild(job.name);
        return toProjectStatus(job, build);
      })
    );

    return NextResponse.json({ projects });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch projects", message },
      { status: 500 }
    );
  }
}
