import { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, Shield, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";
import { fadeUp, fadeDown, scaleIn, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setData(response.data.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const { stats, chartData, recentUsers } = data;

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersThisWeek}`,
      up: true,
      icon: Users,
      color: "text-primary dark:text-accent",
    },
    {
      label: "Transaction Volume",
      value: stats.totalVolume >= 1000000 
        ? `$${(stats.totalVolume / 1000000).toFixed(1)}M`
        : stats.totalVolume >= 1000 
          ? `$${(stats.totalVolume / 1000).toFixed(1)}K` 
          : `$${stats.totalVolume.toLocaleString()}`,
      change: "Total processed",
      up: true,
      icon: DollarSign,
      color: "text-accent",
    },
    {
      label: "Pending Trans.",
      value: stats.pendingTransactions,
      change: "Action required",
      up: false,
      icon: TrendingUp,
      color: "text-success",
    },
    {
      label: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      change: stats.totalUsers > 0 
        ? `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total`
        : "0%",
      up: true,
      icon: Shield,
      color: "text-destructive",
    },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeDown} custom={0}>
        <h1 className="font-display text-2xl font-bold text-foreground">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform health and key metrics at a glance
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            variants={scaleIn}
            custom={i}
            className="rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:shadow-lifted"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <s.icon className={cn("h-4 w-4", s.color)} />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
            <p
              className={cn("mt-1 text-xs font-medium", s.up ? "text-accent" : "text-destructive")}
            >
              {s.change} {s.up ? "new" : ""}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} custom={2} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display font-semibold text-foreground">New Users (Weekly)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="users" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-4 font-display font-semibold text-foreground">
            Transaction Volume (Weekly)
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Users */}
      <motion.div
        variants={fadeUp}
        custom={3}
        className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display font-semibold text-foreground">Recent Registrations</h3>
          <a href="/admin/users" className="text-xs font-medium text-accent hover:underline">
            View all
          </a>
        </div>
        <div className="divide-y divide-border">
          {recentUsers.map((u, i) => (
            <motion.div
              key={u.email}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.07, duration: 0.4, ease: "easeOut" }}
              className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/30"
            >
              <div className="gradient-card flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
                {u.f_name?.[0]}{u.l_name?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{u.f_name} {u.l_name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {new Date(u.creation_date).toLocaleDateString()}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                  u.account_status === "active" ? "badge-success" : "badge-danger",
                )}
              >
                {u.account_status}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                  u.is_verified
                    ? "badge-success"
                    : "badge-warning",
                )}
              >
                {u.is_verified ? "Verified" : "Unverified"}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export { AdminOverview as default };
