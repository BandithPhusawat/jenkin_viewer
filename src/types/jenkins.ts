export type BuildStatus =
  | "success"
  | "failure"
  | "running"
  | "unstable"
  | "aborted"
  | "unknown";

export interface JenkinsJob {
  name: string;
  url: string;
  color?: string; // jenkins job color เช่น 'blue', 'red', 'blue_anime' (กำลัง build)
}

export interface JenkinsBuildAction {
  parameters?: Array<{ name: string; value: string | number | boolean }>;
  _class?: string;
}

export interface JenkinsBuild {
  number: number;
  result: "SUCCESS" | "FAILURE" | "UNSTABLE" | "ABORTED" | null;
  building: boolean;
  timestamp: number;
  duration: number;
  url: string;
  actions: JenkinsBuildAction[];
}

export interface ProjectStatus {
  projectName: string;
  status: BuildStatus;
  lastDeployedBranch: string;
  lastDeployedTag: string;
  lastBuildNumber: number | null;
  lastBuildTime: string | null;
  duration: number;
  url: string;
}
