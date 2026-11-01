import type { Metadata } from "next";
import { LeadInbox } from "@/components/admin/lead-inbox";

export const metadata: Metadata = { title: "Contactos" };

export default function LeadsPage() {
  return <LeadInbox />;
}
