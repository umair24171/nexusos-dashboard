"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, BarChart3, Zap, FileText, Bell, Key, CreditCard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { User } from "@/types";

const navItems = [
  { label: "Overview", href: "/", icon: BarChart3 },
  { label: "Agents", href: "/agents", icon: Zap },
  { label: "Logs", href: "/logs", icon: FileText },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "API Keys", href: "/api-keys", icon: Key },
  { label: "Billing", href: "/billing", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData && userData !== "undefined" && userData !== "null") {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-dark-sidebar border-r border-dark-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-2xl font-bold text-accent-blue flex items-center gap-2">
          <Zap className="w-6 h-6" />
          NexusOS
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-accent-blue text-white"
                  : "text-dark-text hover:bg-dark-card"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-dark-border p-4 space-y-4">
        {!loading && user && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-blue flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-text truncate">{user.name}</p>
              <p className="text-xs text-dark-text/60 capitalize">{user.plan} plan</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
