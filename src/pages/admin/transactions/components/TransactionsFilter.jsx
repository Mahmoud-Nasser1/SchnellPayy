import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export default function TransactionsFilter({ search, setSearch, filter, setFilter }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={1}
      className="rounded-2xl border border-border bg-card p-4 shadow-card"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "completed", "failed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all",
                filter === f
                  ? "gradient-accent text-accent-foreground shadow-glow"
                  : "border border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
