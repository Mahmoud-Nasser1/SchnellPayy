import { Eye, UserX, UserCheck, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export default function AdminUsersTable({ 
  users, 
  loading, 
  handleAction, 
  totalUsers, 
  page, 
  setPage, 
  totalPages 
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={2}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["User", "Country", "Joined", "Role", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <motion.tr
                  key={u.user_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                  className="transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="gradient-card flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground">
                        {u.f_name?.[0]}{u.l_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.f_name} {u.l_name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{u.country || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(u.creation_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                        u.account_status === "active" ? "badge-success" : "badge-danger",
                      )}
                    >
                      {u.account_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleAction("view", u)}
                        title="View Details"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleAction("suspend", u)}
                        title={u.account_status === "suspended" ? "Reactivate" : "Suspend"}
                        className={cn(
                          "rounded-lg p-1.5 transition-colors",
                          u.account_status === "suspended"
                            ? "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                            : "text-muted-foreground hover:bg-warning/10 hover:text-warning",
                        )}
                      >
                        {u.account_status === "suspended" ? (
                          <UserCheck className="h-3.5 w-3.5" />
                        ) : (
                          <UserX className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleAction("delete", u)}
                        title="Delete User"
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && users.length === 0 && (
        <div className="py-10 text-center text-muted-foreground">
          <p className="font-medium">No users found</p>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>
          Showing {users.length} of {totalUsers} users
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
