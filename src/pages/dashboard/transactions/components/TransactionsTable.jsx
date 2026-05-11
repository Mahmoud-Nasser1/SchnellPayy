import { ChevronDown, ArrowDownLeft, ArrowUpRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeUp, scaleIn } from "@/lib/motion";

const statusBadge = {
  completed: "badge-success",
  pending: "badge-warning",
  failed: "badge-danger",
};

export default function TransactionsTable({ transactions, totalCount, page, setPage, totalPages, loading, userId, currentUsername }) {
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
              {["Transaction", "Type", "Date", "Status", "Amount"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  <button className="flex items-center gap-1 transition-colors hover:text-foreground">
                    {h} <ChevronDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border relative">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading transactions...</p>
                  </div>
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((tx, i) => {
                const isCredit = 
                  tx.transaction_type === "deposit" || 
                  tx.transaction_type === "refund" || 
                  tx.receiver_id == userId ||
                  (tx.receiver_username && currentUsername && tx.receiver_username.toLowerCase() === currentUsername.toLowerCase());
                  
                const txName = tx.description || tx.sender_name || tx.receiver_name || tx.name || "Transaction";
                const txId = tx.reference_number || tx.transaction_id || tx.id;
                const txDate = tx.created_at ? new Date(tx.created_at).toLocaleDateString() : tx.date;

                return (
                  <motion.tr
                    key={tx.transaction_id || tx.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isCredit ? "bg-accent/15" : "bg-destructive/10",
                          )}
                        >
                          {isCredit ? (
                            <ArrowDownLeft className="h-4 w-4 text-success" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            {txName}
                          </p>
                          <p className="text-xs text-muted-foreground">{txId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                        {tx.transaction_type || tx.category || "Transfer"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{txDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                          statusBadge[tx.status?.toLowerCase()] || "badge-warning",
                        )}
                      >
                        {tx.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          isCredit ? "text-success" : "text-destructive",
                        )}
                      >
                        {isCredit ? "+" : "-"}${Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                );
              })
            ) : null}
          </tbody>
        </table>
      </div>
      {!loading && transactions.length === 0 && (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="py-12 text-center text-muted-foreground"
        >
          <p className="font-medium">No transactions found</p>
          <p className="mt-1 text-sm">Try adjusting your filters</p>
        </motion.div>
      )}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <span>
          Showing {transactions.length} of {totalCount} transactions
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button 
            onClick={() => setPage(p => Math.min(totalPages || p + 1, p + 1))}
            disabled={page >= totalPages || loading}
            className="rounded-lg border border-border px-3 py-1.5 text-xs transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </motion.div>
  );
}
