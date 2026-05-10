"use client";

import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/stores/filterStore";
import type { ProjectStatus, BuildStatus } from "@/types/jenkins";
import { useMemo } from "react";

async function fetchProjects(): Promise<ProjectStatus[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return data.projects;
}

async function fetchHealth() {
  const res = await fetch("/api/health");
  return res.json();
}

const statusColor: Record<BuildStatus, string> = {
  success: "bg-green-500/20 text-green-400 border-green-500/40",
  failure: "bg-red-500/20 text-red-400 border-red-500/40",
  running: "bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse",
  unstable: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  aborted: "bg-gray-500/20 text-gray-400 border-gray-500/40",
  unknown: "bg-gray-700/20 text-gray-500 border-gray-700/40",
};

export default function Dashboard() {
  const { search, statusFilter, setSearch, setStatusFilter } = useFilterStore();

  const health = useQuery({ queryKey: ["health"], queryFn: fetchHealth });

  const projects = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const filtered = useMemo(() => {
    const list = projects.data ?? [];
    return list.filter((p) => {
      const matchSearch = p.projectName
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ? true : p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [projects.data, search, statusFilter]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jenkins Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">
              จัดการและติดตาม build status จาก Jenkins
            </p>
          </div>
          <div className="text-right text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  health.data?.jenkins?.connected
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-gray-400">
                Jenkins:{" "}
                {health.data?.jenkins?.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="ค้นหา project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as BuildStatus | "all")
            }
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="running">Running</option>
            <option value="unstable">Unstable</option>
            <option value="aborted">Aborted</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Loading / Error */}
        {projects.isLoading && (
          <div className="text-gray-400">กำลังโหลดข้อมูล...</div>
        )}
        {projects.isError && (
          <div className="text-red-400">
            เกิดข้อผิดพลาด: {(projects.error as Error).message}
          </div>
        )}

        {/* Projects table */}
        {projects.data && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-800">
                <tr className="text-left text-sm text-gray-400">
                  <th className="px-6 py-3 font-medium">Project</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Branch</th>
                  <th className="px-6 py-3 font-medium">Tag</th>
                  <th className="px-6 py-3 font-medium">Build #</th>
                  <th className="px-6 py-3 font-medium">Last Build</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      ไม่พบข้อมูล
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr
                    key={p.projectName}
                    className="border-b border-gray-800/50 hover:bg-gray-900/30"
                  >
                    <td className="px-6 py-4 font-medium">{p.projectName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded border ${
                          statusColor[p.status]
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {p.lastDeployedBranch}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {p.lastDeployedTag}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {p.lastBuildNumber ? `#${p.lastBuildNumber}` : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {p.lastBuildTime
                        ? new Date(p.lastBuildTime).toLocaleString("th-TH")
                        : "ยังไม่เคย build"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          อัพเดทอัตโนมัติทุก 30 วินาที | Total:{" "}
          {projects.data?.length ?? 0} projects
        </div>
      </div>
    </main>
  );
}
