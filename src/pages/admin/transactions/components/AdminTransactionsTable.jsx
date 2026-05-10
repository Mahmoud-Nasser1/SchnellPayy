import { ChevronDown, ArrowDownLeft, ArrowUpRight, Loader2, AlertTriangle, CheckCircle, XCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeUp, scaleIn } from "@/lib/motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { useState } from "react";

const statusBadge = {
  completed: "badge-success",
  pending: "badge-warning",
  failed: "badge-danger",
};

export default function AdminTransactionsTable({ transactions, totalCount, page, setPage, totalPages, loading, userId, onTransactionUpdate }) {
  const [actionLoading, setActionLoading] = useState(null);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/transactions/${id}/status`, { status });
      toast.success(`Transaction marked as ${status}`);
      if (onTransactionUpdate) onTransactionUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async (id) => {
    setActionLoading(id);
    try {
      await api.post(`/transactions/${id}/refund`);
      toast.success("Transaction refunded successfully");
      if (onTransactionUpdate) onTransactionUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to refund transaction");
    } finally {
      setActionLoading(null);
    }
  };

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
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border relative">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Loading transactions...</p>
                  </div>
                </td>
              </tr>
            ) : transactions.length > 0 ? (
              transactions.map((tx, i) => {
                const isIncome = tx.transaction_type === "deposit" || tx.transaction_type === "refund";
                const isExpense = tx.transaction_type === "withdraw" || tx.transaction_type === "bill";
                const isNeutral = tx.transaction_type === "transfer";
                  
                const txName = tx.description || tx.sender_name || tx.receiver_name || tx.name || "Transaction";
                const txId = tx.reference_number || tx.transaction_id || tx.id;
                const txDate = tx.created_at ? new Date(tx.created_at).toLocaleDateString() : tx.date;
                const isHighRisk = Math.abs(tx.amount) > 10000;

                return (
                  <motion.tr
                    key={tx.transaction_id || tx.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "group transition-colors hover:bg-muted/30",
                      isHighRisk && "bg-destructive/5"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            isIncome ? "bg-accent/15" : isExpense ? "bg-destructive/10" : "bg-muted",
                          )}
                        >
                          {isIncome ? (
                            <ArrowDownLeft className="h-4 w-4 text-accent" />
                          ) : isExpense ? (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          ) : (
                            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground flex items-center gap-2">
                            {txName}
                            {isHighRisk && (
                              <span title="High Risk Transaction">
                                <AlertTriangle className="h-3 w-3 text-destructive" />
                              </span>
                            )}
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
                          isIncome ? "text-accent" : isExpense ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {isIncome ? "+" : isExpense ? "-" : ""}${Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tx.status?.toLowerCase() === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(tx.transaction_id, "completed")}
                              disabled={actionLoading === tx.transaction_id}
                              className="flex items-center justify-center rounded-lg bg-success/10 p-1.5 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                              title="Approve Transaction"
                            >
                              {actionLoading === tx.transaction_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(tx.transaction_id, "failed")}
                              disabled={actionLoading === tx.transaction_id}
                              className="flex items-center justify-center rounded-lg bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                              title="Fail Transaction"
                            >
                              {actionLoading === tx.transaction_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            </button>
                          </>
                        )}
                        {tx.status?.toLowerCase() === "completed" && 
                         tx.transaction_type === "transfer" && 
                         !tx.description?.startsWith("Refund") && (
                          <button
                            onClick={() => handleRefund(tx.transaction_id)}
                            disabled={actionLoading === tx.transaction_id}
                            className="flex items-center justify-center rounded-lg bg-warning/10 p-1.5 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
                            title="Refund Transaction"
                          >
                            {actionLoading === tx.transaction_id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
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
