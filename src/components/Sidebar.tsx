"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, BarChart3, Zap, FileText, Bell, Key, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { User } from "@/types";

const navItems = [
  { label: "Overview",  href: "/",        icon: BarChart3 },
  { label: "Agents",    href: "/agents",   icon: Zap       },
  { label: "Logs",      href: "/logs",     icon: FileText  },
  { label: "Alerts",    href: "/alerts",   icon: Bell      },
  { label: "API Keys",  href: "/api-keys", icon: Key       },
  { label: "Billing",   href: "/billing",  icon: CreditCard },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw && raw !== "undefined" && raw !== "null") {
      try { setUser(JSON.parse(raw)); } catch { localStorage.removeItem("user"); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="fixed left-0 top-0 w-56 h-screen bg-dark-bg border-r border-dark-border flex flex-col">

      {/* ── Logo ── */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-7 h-7 border border-accent-blue flex items-center justify-center flex-shrink-0">
          <span className="font-mono text-accent-blue text-xs font-bold leading-none">NX</span>
        </div>
        <span className="font-mono text-xs tracking-[0.2em] text-dark-text uppercase">nexusos</span>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-dark-border" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 pt-4 pb-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon     = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group",
                isActive
                  ? "text-accent-blue"
                  : "text-nx-muted hover:text-dark-text"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-0.5 bg-accent-blue rounded-r-full" />
              )}

              {/* Active bg tint */}
              {isActive && (
                <span className="absolute inset-0 bg-accent-blue/[0.05] rounded-sm" />
              )}

              <Icon
                className={cn(
                  "w-4 h-4 flex-shrink-0 relative z-10",
                  isActive ? "text-accent-blue" : "text-inherit"
                )}
              />
              <span
                className={cn(
                  "font-mono text-xs relative z-10",
                  isActive ? "font-semibold" : "font-normal"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-dark-border" />

      {/* ── User Section ── */}
      <div className="px-4 py-4 space-y-3">
        {user && (
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div className="w-7 h-7 border border-dark-border bg-dark-card flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-accent-blue text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs text-dark-text truncate leading-tight">{user.name}</p>
              {/* Plan badge */}
              <span className="inline-block font-mono text-[10px] text-accent-blue/80 border border-accent-blue/25 px-1.5 py-px rounded-sm capitalize leading-tight mt-0.5">
                {user.plan}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-nx-muted hover:text-nx-red transition-colors duration-150 font-mono text-xs px-1"
        >
          <LogOut className="w-3 h-3" />
          sign out
        </button>
      </div>
    </div>
  );
}
