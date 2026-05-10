import { Activity, AlertTriangle, Shield, Key, Smartphone, User, RefreshCw, SmartphoneNfc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { format, formatDistanceToNow } from "date-fns";

const ACTION_MAP = {
  login_success: {
    label: "Login Success",
    icon: Shield,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    risk: "low",
  },
  login_failed: {
    label: "Failed Login Attempt",
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    risk: "high",
  },
  password_changed: {
    label: "Password Changed",
    icon: Key,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    risk: "medium",
  },
  profile_updated: {
    label: "Profile Updated",
    icon: User,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    risk: "low",
  },
  "2fa_enabled": {
    label: "2FA Enabled",
    icon: Smartphone,
    color: "text-accent",
    bg: "bg-accent/10",
    risk: "low",
  },
  "2fa_disabled": {
    label: "2FA Disabled",
    icon: Shield,
    color: "text-warning",
    bg: "bg-warning/10",
    risk: "high",
  },
  backup_codes_regenerated: {
    label: "Backup Codes Regenerated",
    icon: SmartphoneNfc,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    risk: "medium",
  },
};

export default function SettingsActivityLog() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["activity-logs"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/activity-log?page=${pageParam}&limit=10`);
      return res.data.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const allLogs = data?.pages.flatMap((page) => page.logs) || [];

  if (isLoading) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center space-y-4">
        <RefreshCw className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm text-muted-foreground animate-pulse">Fetching your security history...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center space-y-4 text-center px-6">
        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-foreground">Failed to load logs</p>
          <p className="text-xs text-muted-foreground">There was an issue connecting to the security server.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground">
            Security Activity Log
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor recent activity on your account to ensure it's secure.
          </p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:inline-flex">
          Export Log
        </Button>
      </div>

      <div className="space-y-3">
        {allLogs.length === 0 ? (
          <div className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No activity recorded yet</p>
          </div>
        ) : (
          allLogs.map((log, i) => {
            const config = ACTION_MAP[log.action] || {
              label: log.action.replace(/_/g, " "),
              icon: Activity,
              color: "text-muted-foreground",
              bg: "bg-muted",
              risk: "low",
            };
            const Icon = config.icon;
            const dateObj = log.created_at ? new Date(log.created_at) : new Date();

            return (
              <motion.div
                key={log.log_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5), duration: 0.35 }}
                className="flex items-start gap-3.5 rounded-xl border border-border p-4 transition-all hover:border-accent/30 hover:bg-muted/30"
              >
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {config.label}
                    </p>
                    {config.risk === "high" && (
                      <span className="bg-destructive/10 text-destructive text-[10px] font-bold uppercase px-1.5 py-0.5 rounded tracking-tighter">
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {log.description || "No additional details"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                      <Shield className="h-3 w-3" />
                      {log.ip_address || "Unknown IP"}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded max-w-[150px] truncate">
                      <Smartphone className="h-3 w-3" />
                      {log.device || "Unknown Device"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-bold text-foreground whitespace-nowrap">
                    {format(dateObj, "MMM d, h:mm a")}
                  </p>
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                    {formatDistanceToNow(dateObj, { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {hasNextPage && (
        <div className="pt-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="text-accent hover:bg-accent/10 hover:text-accent font-semibold"
          >
            {isFetchingNextPage ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              "View Older Activity"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
