"use client";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AdminDashboardPage = dynamic(
  () => import("@/components/admin/AdminDashboardPage"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    ),
  }
);

export default function AdminPage() {
  return <AdminDashboardPage />;
}
