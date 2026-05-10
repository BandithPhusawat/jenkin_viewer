import axios, { AxiosInstance } from "axios";
import type { JenkinsJob, JenkinsBuild } from "@/types/jenkins";

class JenkinsClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.JENKINS_URL || "http://jenkins:8080";
    const username = process.env.JENKINS_USER || "admin";
    const password = process.env.JENKINS_API_TOKEN || "admin123";

    this.client = axios.create({
      baseURL,
      auth: { username, password },
      timeout: 10000,
      headers: { "Content-Type": "application/json" },
    });
  }

  async getJobs(): Promise<JenkinsJob[]> {
    const { data } = await this.client.get(
      "/api/json?tree=jobs[name,url,color]"
    );
    return data.jobs ?? [];
  }

  async getLastBuild(jobName: string): Promise<JenkinsBuild | null> {
    try {
      const { data } = await this.client.get<JenkinsBuild>(
        `/job/${encodeURIComponent(jobName)}/lastBuild/api/json`
      );
      return data;
    } catch {
      // ยังไม่เคย build
      return null;
    }
  }

  async getServerInfo() {
    const { data } = await this.client.get("/api/json");
    return data;
  }
}

export const jenkinsClient = new JenkinsClient();
