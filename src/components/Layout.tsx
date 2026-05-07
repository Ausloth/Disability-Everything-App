import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";
import {
  CalendarDays,
  Users,
  Sparkles,
  FileBox,
  Home,
  Target,
  FileText,
  DollarSign,
  Lock,
  Settings,
  Moon,
  Sun,
  Grid,
  BookOpenText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeModules, user, setRole, logout } = useStore();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const isManager = user?.role === "Admin" || user?.role === "Coordinator";

  const coreNav = [
    { name: "Dashboard", href: "/", icon: Home, show: true },
    {
      name: isManager ? "Timetable Management" : "Timetable",
      href: "/roster",
      icon: CalendarDays,
      show: true,
    },
    { name: "Activities", href: "/activities", icon: FileBox, show: true },
    { name: "Journal Tool", href: "/journal", icon: BookOpenText, show: true },
    {
      name: "Communication Boards",
      href: "/comm-boards",
      icon: Grid,
      show: true,
    },
    { name: "Clients", href: "/clients", icon: Users, show: true },
    {
      name: "AI Prompt Generator",
      href: "/prompt-generator",
      icon: Sparkles,
      show: isManager,
    },
  ];

  const premiumNav = [
    {
      name: "Program Database",
      module: "ProgramDatabase",
      icon: FileBox,
      href: "#",
    },
    {
      name: "Client Outcomes",
      module: "ClientOutcomes",
      icon: Target,
      href: "#",
    },
    {
      name: "Documentation",
      module: "Documentation",
      icon: FileText,
      href: "#",
    },
    { name: "Finance / NDIS", module: "Finance", icon: DollarSign, href: "#" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white dark:bg-slate-900 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="text-xl font-bold tracking-tight">Outline.</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Core (Free)
            </h3>
            <div className="space-y-1">
              {coreNav
                .filter((item) => item.show)
                .map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
            </div>
          </div>

          <div>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              Premium Modules
            </h3>
            <div className="space-y-1">
              {premiumNav.map((item) => {
                const isUnlocked =
                  activeModules[item.module as keyof typeof activeModules];
                return (
                  <div
                    key={item.name}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium",
                      isUnlocked
                        ? "text-slate-600 cursor-pointer hover:bg-slate-50"
                        : "text-slate-400/70 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </div>
                    {!isUnlocked && <Lock className="h-3 w-3 text-slate-400" />}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t flex flex-col gap-2">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings & Licensing
          </Link>
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name}</span>
              <span className="text-xs text-slate-500">{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight md:hidden">
              Outline.
            </h2>
          </div>
          {/* Global Header Actions */}
          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <select
              value={user?.role}
              onChange={(e) =>
                setRole(
                  e.target.value as "Admin" | "Coordinator" | "SupportWorker",
                )
              }
              className="text-xs md:text-sm border rounded px-2 py-1 bg-transparent max-w-[120px] md:max-w-none text-slate-700 dark:text-slate-200"
            >
              <option value="Admin">Manager / Admin</option>
              <option value="SupportWorker">Support Worker</option>
            </select>
            <button
              onClick={toggleDark}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-slate-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-medium">
              {user?.name.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </div>

        {/* Mobile Navigation (Bottom) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t z-50 flex items-center justify-between px-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
          {coreNav
            .filter((item) => item.show)
            .slice(0, 5)
            .map((item) => {
              // Precise active state matching
              const isActive =
                location.pathname === item.href ||
                (location.pathname.startsWith(item.href + "/") &&
                  item.href !== "/");

              // Shorten names for mobile nav
              let shortName = item.name;
              if (shortName === "Dashboard") shortName = "My Day";
              if (shortName === "Timetable Management") shortName = "Timetable";
              if (shortName === "Communication Boards") shortName = "Boards";
              if (shortName === "Prompt Generator") shortName = "AI Tools";

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 py-3 gap-1 relative",
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50",
                  )}
                >
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-emerald-500 rounded-b-full"></div>
                  )}
                  <item.icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                    {shortName}
                  </span>
                </Link>
              );
            })}
        </nav>
      </main>
    </div>
  );
}
