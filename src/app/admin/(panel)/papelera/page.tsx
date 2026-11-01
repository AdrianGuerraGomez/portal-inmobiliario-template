import type { Metadata } from "next";
import { TrashList } from "@/components/admin/trash-list";

export const metadata: Metadata = { title: "Papelera" };

export default function TrashPage() {
  return <TrashList />;
}
