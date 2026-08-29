/**
 * Teams Chat & Calling Page — Real-time Messaging, 1:1 Calls & Conferences.
 */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import TeamsChat from "@/modules/chat/TeamsChat";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <Layout>
      <div className="space-y-4">
        <TeamsChat />
      </div>
    </Layout>
  );
}
