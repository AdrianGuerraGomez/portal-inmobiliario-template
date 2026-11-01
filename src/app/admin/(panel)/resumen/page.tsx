import type { Metadata } from "next";
import { AdminOnly } from "@/components/admin/admin-only";
import { WeeklyReportView } from "@/components/admin/weekly-report-view";

export const metadata: Metadata = { title: "Resumen semanal" };

export default function WeeklyReportPage() {
  return (
    <AdminOnly>
      <WeeklyReportView />
    </AdminOnly>
  );
}
