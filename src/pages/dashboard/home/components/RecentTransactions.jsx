import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import { format } from "date-fns";

function RecentTransactions() {
  const { user } = useAuthStore();
  const userData = user?.data || user || {};
  const currentUsername = userData?.user_name || user?.user_name;
  const userId = userData?.user_id || userData?.id || user?.user_id || user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const response = await api.get("/transactions/user?limit=5");
      return response.data;
    },
    enabled: !! currentUsername,
  });

  const transactions = data?.data || [];

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-display font-semibold text-foreground">
          Recent Transactions
        </h3>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs text-accent hover:text-accent"
        >
          <Link to="/dashboard/transactions">View All</Link>
        </Button>
      </div>

      <div className="divide-y divide-border">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <RefreshCw className="mb-2 h-6 w-6 animate-spin text-accent" />
            <p className="text-xs">Loading history...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center px-4">
            <Clock className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs mt-1">Your recent activity will appear here.</p>
          </div>
        ) : (
          transactions.map((tx) => {
            const isReceived = 
              tx.receiver_id == userId ||
              (tx.receiver_username && currentUsername && tx.receiver_username.toLowerCase() === currentUsername.toLowerCase()) ||
              tx.transaction_type === "deposit" ||
              tx.transaction_type === "refund";
            const counterparty = isReceived
              ? tx.sender_name || (tx.transaction_type === "refund" ? "Refund" : "Deposit")
              : tx.receiver_name || tx.description || "Payment";
            const amount = parseFloat(tx.amount);
            const currency = userData?.currency || "EGP";

            return (
              <div
                key={tx.transaction_id}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
              >
                <div className="gradient-card flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-primary-foreground">
                  {getInitials(counterparty)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {counterparty}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.created_at ? format(new Date(tx.created_at), "MMM d, h:mm a") : "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div className="flex flex-col items-end">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        isReceived ? "text-success" : "text-destructive",
                      )}
                    >
                      {isReceived ? "+" : "-"}
                      {new Intl.NumberFormat("en-EG", {
                        style: "currency",
                        currency: currency,
                      }).format(amount)}
                    </p>
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-tighter",
                      tx.status === 'completed' ? "text-success/70" : "text-warning/70"
                    )}>
                      {tx.status}
                    </span>
                  </div>
                  {isReceived ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentTransactions;
