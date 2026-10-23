"use client";
import { useAuth } from "@/context/AuthContext";
import { Bell, HelpCircle, Menu } from "lucide-react";
import { titleCase } from "@/lib/utils";

interface Props {
  onOpenMenu: () => void;
}

export default function Topbar({ onOpenMenu }: Props) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="rounded-xl p-2 text-ink-600 transition-colors hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-900 text-sm font-bold text-white shadow-lg shadow-primary-200">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-ink-900">{user?.name || "User"}</p>
              <p className="text-xs text-ink-500">{titleCase(user?.role ?? "")}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="mr-2 hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-ink-600 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            CampusVoice
          </span>
          <button
            aria-label="Notifications"
            className="relative rounded-xl p-2.5 text-ink-600 transition-colors hover:bg-slate-100 hover:text-primary-600"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
          </button>
          <button
            aria-label="Help"
            className="rounded-xl p-2.5 text-ink-600 transition-colors hover:bg-slate-100 hover:text-primary-600"
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}