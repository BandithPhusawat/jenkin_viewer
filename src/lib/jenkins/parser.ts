import type {
  BuildStatus,
  JenkinsBuild,
  JenkinsJob,
  ProjectStatus,
} from "@/types/jenkins";

export function mapJenkinsResult(
  result: JenkinsBuild["result"],
  building: boolean
): BuildStatus {
  if (building) return "running";
  if (!result) return "unknown";
  switch (result) {
    case "SUCCESS":
      return "success";
    case "FAILURE":
      return "failure";
    case "UNSTABLE":
      return "unstable";
    case "ABORTED":
      return "aborted";
    default:
      return "unknown";
  }
}

/**
 * ดึง parameters ของ build ออกมาเป็น object ปกติ
 * Jenkins เก็บไว้ใน actions[].parameters[] แบบกระจาย
 */
export function extractParameters(
  build: JenkinsBuild | null
): Record<string, string> {
  if (!build) return {};
  const params: Record<string, string> = {};
  for (const action of build.actions ?? []) {
    if (action.parameters) {
      for (const p of action.parameters) {
        params[p.name] = String(p.value);
      }
    }
  }
  return params;
}

/**
 * รวมข้อมูลจาก job + last build เป็น ProjectStatus
 */
export function toProjectStatus(
  job: JenkinsJob,
  build: JenkinsBuild | null
): ProjectStatus {
  const params = extractParameters(build);

  // Jenkins job มี color เช่น 'blue_anime' ระหว่าง build
  // ถ้ายังไม่มี build ลองใช้ color เป็น fallback
  let status: BuildStatus = "unknown";
  if (build) {
    status = mapJenkinsResult(build.result, build.building);
  } else if (job.color) {
    if (job.color.includes("anime")) status = "running";
    else if (job.color.startsWith("blue")) status = "success";
    else if (job.color.startsWith("red")) status = "failure";
    else if (job.color.startsWith("yellow")) status = "unstable";
  }

  return {
    projectName: job.name,
    status,
    lastDeployedBranch:
      params.BRANCH || params.GIT_BRANCH || params.branch || "-",
    lastDeployedTag: params.TAG || params.VERSION || params.tag || "-",
    lastBuildNumber: build?.number ?? null,
    lastBuildTime: build?.timestamp
      ? new Date(build.timestamp).toISOString()
      : null,
    duration: build?.duration ?? 0,
    url: job.url,
  };
}
