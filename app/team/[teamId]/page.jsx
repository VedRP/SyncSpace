/**
 * Team Detail Page — Minimal team details.
 */
"use client";

import Layout from "@/components/Layout";
import Link from "next/link";

export default function TeamDetailPage({ params }) {
  const { teamId } = params;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Team</h1>
            <p className="text-sm text-slate-600 mt-1">Team: {teamId}</p>
          </div>
          <Link
            href="/team"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Back
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Members</div>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex items-center justify-between">
              <span>Vedant</span>
              <span className="text-slate-500">Owner</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Asha</span>
              <span className="text-slate-500">Member</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Ravi</span>
              <span className="text-slate-500">Member</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
