import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: "CampusVoice - Feedback Management System",
  description: "Student feedback management system for colleges",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-ink-900">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: "12px", fontSize: "14px", boxShadow: "0 8px 24px rgba(15,23,42,.08)" },
              success: { iconTheme: { primary: "#4F46E5", secondary: "#fff" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}