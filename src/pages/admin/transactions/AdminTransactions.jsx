import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeDown, stagger } from "@/lib/motion";
import api from "@/lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import TransactionsFilter from "./components/TransactionsFilter";
import AdminTransactionsTable from "./components/AdminTransactionsTable";
import useAuthStore from "@/store/authStore";

function AdminTransactions() {
  const { user } = useAuthStore();
  const userId = user?.data?.user_id || user?.user_id;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [downloadLoading, setDownloadLoading] = useState(false);

  // Pagination & Data states
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Reset page when filters change
  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  
  const handleFilterChange = (val) => {
    setFilter(val);
    setPage(1);
  };


  useEffect(() => {
    let active = true;
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params = { page, limit };
        if (filter !== "all") {
          params.status = filter;
        }
        if (search) {
          params.search = search;
        }

        const res = await api.get('/transactions', { params });
        if (active && res.data) {
          setTransactions(res.data.data || []);
          setTotalCount(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch transactions:", error);
        if (active) {
          setTransactions([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300); // debounce for search typing

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [page, limit, filter, search, refreshTrigger]);


  const handleDownload = async () => {
    if (totalCount === 0) return;
    
    setDownloadLoading(true);
    try {
      // Fetch all transactions for the current filter
      const params = { page: 1, limit: totalCount || 1000 };
      if (filter !== "all") {
        params.status = filter;
      }
      if (search) {
        params.search = search;
      }
      
      const res = await api.get('/transactions', { params });
      const allTransactions = res.data?.data || [];

      if (allTransactions.length === 0) return;

      const doc = new jsPDF();
      doc.text("All Users Transaction History (Admin)", 14, 15);
      
      const tableColumn = ["ID / Ref", "Description", "Type", "Status", "Date", "Amount"];
      const tableRows = [];

      allTransactions.forEach(tx => {
        // Evaluate isCredit based on transaction logic
        const isCredit = 
          tx.transaction_type === "deposit" || 
          (tx.transaction_type === "transfer" && tx.receiver_id === userId);

        const txName = tx.description || tx.sender_name || tx.receiver_name || tx.name || "Transaction";
        const txId = tx.reference_number || tx.transaction_id || tx.id;
        const txDate = tx.created_at ? new Date(tx.created_at).toLocaleDateString() : tx.date;
        const sign = isCredit ? "+" : "-";

        tableRows.push([
          txId,
          txName,
          tx.transaction_type || tx.category || "Transfer",
          tx.status || "Pending",
          txDate,
          `${sign}$${Math.abs(tx.amount).toLocaleString()}`,
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });

      doc.save("admin_transactions_history.pdf");
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div
        variants={fadeDown}
        custom={0}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Global Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and review all system transactions
          </p>
        </div>
        <Button variant="outline" onClick={handleDownload} disabled={downloadLoading}>
          {downloadLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
              Generating PDF...
            </div>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </motion.div>

      <TransactionsFilter
        search={search}
        setSearch={handleSearchChange}
        filter={filter}
        setFilter={handleFilterChange}
      />

      <AdminTransactionsTable 
        transactions={transactions} 
        totalCount={totalCount} 
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        loading={loading}
        userId={userId}
        onTransactionUpdate={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </motion.div>
  );
}
export { AdminTransactions as default };
