import type { Metadata } from "next";
import { ActivityLog } from "@/components/admin/activity-log";
import { AdminOnly } from "@/components/admin/admin-only";

export const metadata: Metadata = { title: "Actividad" };

export default function ActivityPage() {
  return (
    <AdminOnly>
      <ActivityLog />
    </AdminOnly>
  );
}
