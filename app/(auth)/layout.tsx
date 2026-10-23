import { ReactNode } from "react";
import AuthBrandPanel from "@/components/auth/AuthBrandPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <AuthBrandPanel />
      <section className="flex items-center justify-center p-6 sm:p-12 bg-slate-50">{children}</section>
    </main>
  );
}