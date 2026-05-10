import { useState, useEffect } from "react";
import { X, Bell, DollarSign, Shield, AlertTriangle, Info, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const iconMap = {
  transfer: { icon: DollarSign, bg: "bg-accent/15 text-accent" },
  kyc: { icon: Shield, bg: "bg-primary/15 text-primary" },
  warning: { icon: AlertTriangle, bg: "bg-warning/15 text-warning" },
  default: { icon: Info, bg: "bg-muted/30 text-muted-foreground" },
};

function NotificationsPanel({ onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchNotifications = async (page = 1, append = false, silent = false) => {
    try {
      if (page === 1 && !silent) setLoading(true);
      else if (!silent) setLoadingMore(true);

      const res = await api.get(`/notifications?page=${page}&limit=10`);
      
      if (append) {
        setList((prev) => [...prev, ...res.data.data]);
      } else {
        setList(res.data.data);
      }
      
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);

    // Set up polling for "real-time" updates every 15 seconds
    const interval = setInterval(() => {
      // Only poll the first page silently
      fetchNotifications(1, false, true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      fetchNotifications(pagination.page + 1, true);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setList((prev) => prev.map((n) => n.id === id ? { ...n, isRead: 1 } : n));
    } catch (error) {
      console.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setList((prev) => prev.map((n) => ({ ...n, isRead: 1 })));
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      setList((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification");
    }
  };

  const handleClearAll = async () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      setTimeout(() => setConfirmingClear(false), 3000);
      return;
    }

    try {
      await api.delete("/notifications/delete-all");
      setList([]);
      setConfirmingClear(false);
    } catch (error) {
      console.error("Failed to clear all notifications");
    }
  };

  const unreadCount = list.filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 animate-slide-down overflow-hidden rounded-2xl border border-border bg-card shadow-lifted">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-foreground" />
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex py-12 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <>
            {list.map((n) => {
              const config = iconMap[n.type?.toLowerCase()] || iconMap.default;
              return (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0 hover:bg-muted/40",
                    !n.isRead && "bg-accent/5",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                      config.bg,
                    )}
                  >
                    <config.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn(
                        "text-sm leading-tight text-foreground",
                        !n.isRead ? "font-bold" : "font-medium"
                      )}>
                        {n.title}
                      </p>
                      {!n.isRead && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent animate-pulse" />}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  <button 
                    onClick={(e) => deleteNotification(e, n.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            
            {pagination.page < pagination.totalPages && (
              <div className="p-2 text-center border-t border-border/30 bg-muted/5">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="text-xs font-medium text-accent hover:underline disabled:opacity-50 flex items-center justify-center w-full gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading...
                    </>
                  ) : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {list.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2 bg-muted/20">
          <button 
            onClick={markAllAsRead}
            className="text-[10px] font-medium text-accent hover:underline"
          >
            Mark all as read
          </button>
          <button 
            onClick={handleClearAll}
            className={cn(
              "text-[10px] font-medium transition-colors",
              confirmingClear 
                ? "text-destructive font-bold animate-pulse" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {confirmingClear ? "Are you sure?" : "Clear all"}
          </button>
        </div>
      )}
    </div>
  );
}

export default NotificationsPanel;
