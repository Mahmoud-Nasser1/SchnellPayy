import { X, AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ViewUserModal({ user, onClose }) {
  if (!user) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 24, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lifted"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">User Details</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-5 flex items-center gap-3 rounded-xl bg-muted/50 p-4">
          <div className="gradient-card flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-primary-foreground">
            {user.f_name?.[0]}{user.l_name?.[0]}
          </div>
          <div>
            <p className="font-bold text-foreground">{user.f_name} {user.l_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                  user.account_status === "active" ? "badge-success" : "badge-danger",
                )}
              >
                {user.account_status}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                  user.is_verified ? "badge-success" : "badge-warning",
                )}
              >
                {user.is_verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            ["Username", user.user_name],
            ["Phone", user.phone],
            ["Country", user.country],
            ["Joined", new Date(user.creation_date).toLocaleDateString()],
            ["Role", user.role],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border-b border-border/50 py-2 last:border-0"
            >
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="text-sm font-semibold capitalize text-foreground">{v || "N/A"}</span>
            </div>
          ))}
        </div>
        <Button variant="accent" className="mt-5 w-full shadow-glow" onClick={onClose}>
          Close
        </Button>
      </motion.div>
    </motion.div>
  );
}

export function ConfirmModal({ title, desc, onConfirm, onClose, variant = "destructive", loading = false }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-lifted"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full",
            variant === "destructive" ? "bg-destructive/10" : "bg-accent/10",
          )}
        >
          {variant === "destructive" ? (
            <AlertCircle className="h-7 w-7 text-destructive" />
          ) : (
            <Check className="h-7 w-7 text-accent" />
          )}
        </div>
        <h3 className="mb-2 font-display font-bold text-foreground">{title}</h3>
        <p className="mb-6 text-sm text-muted-foreground">{desc}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "accent"}
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
