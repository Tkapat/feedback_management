"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { navFor } from "@/constants/nav";
import { LogOut, X, PanelLeft } from "lucide-react";
import { titleCase } from "@/lib/utils";

interface Props {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onCloseMobile }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const items = navFor(user?.role ?? "student");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-900 text-white shadow-lg shadow-primary-200">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-ink-900">CampusVoice</h2>
            <p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
              {titleCase(user?.role ?? "")} Portal
            </p>
          </div>
        </Link>
        <button
          onClick={onCloseMobile}
          aria-label="Close menu"
          className="rounded-lg p-2 text-ink-500 hover:bg-slate-100 lg:hidden"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onCloseMobile}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-600 text-white shadow-soft"
                  : "text-ink-600 hover:bg-primary-50 hover:text-primary-700"
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  active
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-primary-600"
                }`}
              >
                <Icon size={16} />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-700 text-xs font-bold text-white">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{user?.name}</p>
            <p className="truncate text-xs text-ink-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-50">
            <LogOut size={16} />
          </span>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {nav}
      </aside>
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
            onClick={onCloseMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden">{nav}</aside>
        </>
      )}
    </>
  );
}