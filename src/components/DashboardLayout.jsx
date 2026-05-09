import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  Download,
  Receipt,
  CreditCard,
  Settings,
  Bell,
  ChevronDown,
  Shield,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  TrendingUp,
  Wallet,
  Users,
  BarChart3,
  FileCheck,
  ChevronLeft,
  Server,
  Layers,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import NotificationsPanel from "@/components/NotificationsPanel";
import useAuthStore from "@/store/authStore";
import { useNavigate } from "react-router-dom";
const userNav = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: Send, label: "Send Money", to: "/dashboard/send" },
  { icon: Download, label: "Receive Money", to: "/dashboard/receive" },
  { icon: Receipt, label: "Transactions", to: "/dashboard/transactions" },
  { icon: CreditCard, label: "Bills & Payments", to: "/dashboard/bills" },
  { icon: Wallet, label: "Deposit", to: "/dashboard/funds" },
  { icon: Settings, label: "Profile & Security", to: "/dashboard/settings" },
];
const adminNav = [
  { icon: BarChart3, label: "Overview", to: "/admin" },
  { icon: Users, label: "Users", to: "/admin/users" },
  { icon: Receipt, label: "Transactions", to: "/admin/transactions" },
  { icon: FileCheck, label: "KYC Approval", to: "/admin/kyc" },
  { icon: Server, label: "Providers", to: "/admin/providers" },
  { icon: Layers, label: "Services", to: "/admin/services" },
];
function DashboardLayout({ isAdmin = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const nav = isAdmin ? adminNav : userNav;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate("/login");
    setIsLoggingOut(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside
        className={cn(
          "hidden flex-col border-r border-sidebar-border bg-sidebar lg:flex",
          "shrink-0 transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-[68px]",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border",
            sidebarOpen ? "gap-3 px-5" : "justify-center px-2",
          )}
        >
          <div className="gradient-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-glow">
            <Shield className="h-4 w-4 text-accent-foreground" />
          </div>
          {sidebarOpen && (
            <span className="overflow-hidden whitespace-nowrap font-display text-[17px] font-bold text-sidebar-foreground">
              Schnell<span className="text-sidebar-primary">Pay</span>
              {isAdmin && (
                <span className="ml-2 rounded bg-warning/20 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-warning">
                  ADMIN
                </span>
              )}
            </span>
          )}
        </div>
        {/* Nav section label */}
        {sidebarOpen && (
          <div className="px-5 pb-1 pt-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
              {isAdmin ? "Administration" : "Main Menu"}
            </p>
          </div>
        )}
        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-2">
          {nav.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard" || to === "/admin"}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "text-sidebar-foreground/75 transition-all duration-150",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                !sidebarOpen && "justify-center px-0",
              )}
              activeClassName="bg-sidebar-primary/12 text-sidebar-primary border-r-2 border-sidebar-primary"
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>
        {/* Bottom */}
        <div
          className={cn(
            "border-t border-sidebar-border p-2.5",
            !sidebarOpen && "flex justify-center",
          )}
        >
          <Link
            // to="/login"
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
              "text-sidebar-foreground/45 hover:bg-destructive/10 hover:text-destructive",
              "transition-colors duration-150",
              !sidebarOpen && "justify-center px-0",
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </Link>
        </div>
      </aside>
      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-72 animate-slide-right flex-col bg-sidebar shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              <div className="flex items-center gap-2.5 font-display text-lg font-bold text-sidebar-foreground">
                <div className="gradient-accent flex h-8 w-8 items-center justify-center rounded-xl">
                  <Shield className="h-4 w-4 text-accent-foreground" />
                </div>
                Secure<span className="text-sidebar-primary">Wallet</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 pb-1 pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/35">
                {isAdmin ? "Administration" : "Main Menu"}
              </p>
            </div>
            <nav className="flex-1 space-y-0.5 px-2.5 py-2">
              {nav.map(({ icon: Icon, label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/dashboard" || to === "/admin"}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-primary/12 text-sidebar-primary"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
      {/* ── Main Content ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 lg:px-6">
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            {isAdmin && (
              <span className="hidden items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning md:inline-flex">
                <TrendingUp className="h-3 w-3" />
                Admin Portal
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setProfileOpen(false);
                }}
                className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-card bg-destructive" />
              </button>
              {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
            </div>
            {/* Profile dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-xl py-1.5 pl-2 pr-3 transition-colors hover:bg-muted"
              >
                <div className="gradient-card flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
                  JD
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold leading-none text-foreground">John Doe</p>
                  <p className="mt-0.5 text-[11px] leading-none text-muted-foreground">
                    Verified Account
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                    profileOpen && "rotate-180",
                  )}
                />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 animate-slide-down rounded-2xl border border-border bg-card py-1.5 shadow-xl">
                  {/* Profile header */}
                  <div className="border-b border-border px-4 py-3">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="gradient-card flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-primary-foreground">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">John Doe</p>
                        <p className="text-xs text-muted-foreground">john@example.com</p>
                      </div>
                    </div>
                    <span className="secure-badge">
                      <Shield className="h-2.5 w-2.5" /> KYC Verified
                    </span>
                  </div>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                  >
                    {isLoggingOut ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive/20 border-t-destructive" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    {isLoggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
export { DashboardLayout as default };
