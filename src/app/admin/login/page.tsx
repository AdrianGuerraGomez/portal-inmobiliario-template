import type { Metadata } from "next";
import { DemoLogin } from "@/components/admin/demo-login";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return <DemoLogin />;
}
