import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import BalanceCard from "./components/BalanceCard";
import QuickActions from "./components/QuickActions";
import StatsRow from "./components/StatsRow";
import IncomeExpenseChart from "./components/IncomeExpenseChart";
import RecentTransactions from "./components/RecentTransactions";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";

function DashboardHome() {
  const [balanceHidden, setBalanceHidden] = useState(false);
  const { user } = useAuthStore();
  const userData = user?.data || user || {};
  const currentUsername = userData?.user_name || user?.user_name;
  const userId = userData?.user_id || userData?.id || user?.user_id || user?.id;
  const currency = userData?.currency || "EGP";

  const { data: txResponse, isLoading } = useQuery({
    queryKey: ["dashboard-stats-transactions"],
    queryFn: async () => {
      const response = await api.get("/transactions/user?limit=50");
      return response.data;
    },
    enabled: !!currentUsername,
  });

  const stats = useMemo(() => {
    const txs = txResponse?.data || [];
    let income = 0;
    let expenses = 0;

    txs.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0;
      const isReceived = 
        tx.receiver_id == userId ||
        (tx.receiver_username && currentUsername && tx.receiver_username.toLowerCase() === currentUsername.toLowerCase()) ||
        tx.transaction_type === "deposit" ||
        tx.transaction_type === "refund";
      
      if (isReceived) {
        income += amount;
      } else {
        expenses += amount;
      }
    });

    const formatter = new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    });

    return {
      income: formatter.format(income),
      expenses: formatter.format(expenses),
      count: txResponse?.total || txs.length,
    };
  }, [txResponse, currentUsername, currency]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back — here's your financial overview.
        </p>
      </motion.div>

      {/* Balance + Quick Actions */}
      <motion.div variants={fadeUp} custom={1} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BalanceCard balanceHidden={balanceHidden} setBalanceHidden={setBalanceHidden} />
        <QuickActions />
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={fadeUp} custom={2}>
        <StatsRow stats={stats} />
      </motion.div>

      {/* Chart */}
      <motion.div variants={fadeUp} custom={3}>
        <IncomeExpenseChart />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div variants={fadeUp} custom={4}>
        <RecentTransactions />
      </motion.div>
    </motion.div>
  );
}

export { DashboardHome as default };
