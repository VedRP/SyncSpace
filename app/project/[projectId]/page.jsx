/**
 * Project Detail Page — Minimal project details.
 */
"use client";

import Layout from "@/components/Layout";
import Link from "next/link";

export default function ProjectDetailPage({ params }) {
  const { projectId } = params;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Project</h1>
            <p className="text-sm text-slate-600 mt-1">Project: {projectId}</p>
          </div>
          <Link
            href={`/task/${projectId}`}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
          >
            View tasks
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Overview</div>
          <p className="mt-2 text-sm text-slate-600">
            This is a minimal placeholder project page for hackathon-ready navigation.
          </p>
        </div>
      </div>
    </Layout>
  );
}
