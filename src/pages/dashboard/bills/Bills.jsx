import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Zap,
  Wifi,
  Droplets,
  Phone,
  ArrowRight,
  Check,
  TrendingUp,
  CreditCard,
  Download,
  Search,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, scaleIn, scaleUp, stagger } from "@/lib/motion";
import PinVerifyDialog from "@/components/PinVerifyDialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";

// --- Helpers ---
const getCategoryIconAndColor = (categoryName) => {
  const cat = categoryName?.toLowerCase() || "";
  if (cat.includes("internet") || cat.includes("dsl")) return { icon: Wifi, color: "bg-blue-500/15 text-blue-500" };
  if (cat.includes("telecom") || cat.includes("mobile")) return { icon: Phone, color: "bg-accent/15 text-accent" };
  if (cat.includes("util") || cat.includes("electric")) return { icon: Zap, color: "bg-yellow-500/15 text-yellow-500" };
  if (cat.includes("water")) return { icon: Droplets, color: "bg-cyan-500/15 text-cyan-500" };
  return { icon: CreditCard, color: "bg-purple-500/15 text-purple-500" };
};

function BillsPage() {
  const [selectedService, setSelectedService] = useState(null);
  const [paid, setPaid] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Form State
  const [consumerNumber, setConsumerNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [pinOpen, setPinOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { fetchMe } = useAuthStore();

  // --- API Fetches ---
  const { data: services = [], isLoading: loadingServices } = useQuery({
    queryKey: ["bills-services"],
    queryFn: async () => {
      const res = await api.get("/bills/services");
      return res.data?.data || [];
    },
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["bills-history"],
    queryFn: async () => {
      const res = await api.get("/bills/history");
      return res.data?.data || [];
    },
  });

  // --- Payment Mutation ---
  const payMutation = useMutation({
    mutationFn: async (pin) => {
      const payload = {
        service_id: selectedService.service_id,
        amount: Number(amount),
        consumer_number: consumerNumber,
        transaction_pin: pin,
      };
      const res = await api.post("/bills/pay", payload);
      return res.data;
    },
    onSuccess: async (data) => {
      if (data.success) {
        setPaid(true);
        await queryClient.invalidateQueries(["bills-history"]);
        await fetchMe();
      } else {
        toast({
          title: "Payment Failed",
          description: data.message || "Could not process payment.",
          variant: "destructive",
        });
      }
    },
    onError: (err) => {
      toast({
        title: "Payment Failed",
        description: err.response?.data?.message || "Could not process payment.",
        variant: "destructive",
      });
    },
  });

  const filteredHistory = history.filter((b) =>
    b.provider_name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    b.service_name?.toLowerCase().includes(searchQ.toLowerCase())
  );

  // --- Success State ---
  if (paid) {
    return (
      <motion.div
        variants={scaleUp}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-md mt-10"
      >
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-card">
          <div className="gradient-success mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-glow">
            <Check className="h-12 w-12 text-accent-foreground" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
            Payment Successful!
          </h2>
          <p className="mb-1 text-muted-foreground">
            Your bill for <span className="font-semibold text-foreground">{selectedService?.service_name}</span> has been paid.
          </p>
          <p className="mb-6 text-lg font-bold text-accent">
            ${Number(amount).toFixed(2)}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="accent"
              className="shadow-glow flex-1"
              onClick={() => {
                setPaid(false);
                setSelectedService(null);
                setConsumerNumber("");
                setAmount("");
              }}
            >
              Pay Another Bill
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp} custom={0}>
        <h1 className="font-display text-2xl font-bold text-foreground">Bills & Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage and pay all your bills securely in one place.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* --- Services Grid --- */}
        <motion.div variants={fadeUp} custom={1} className="rounded-2xl border border-border bg-card p-5 shadow-card flex flex-col h-[600px]">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-foreground">Available Services</h3>
            
            {/* Category Filter */}
            {!loadingServices && services.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {["All", ...new Set(services.map(s => s.service_category))].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      selectedCategory === cat
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {loadingServices ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 overflow-y-auto p-2 custom-scrollbar flex-1">
              {services
                .filter(s => selectedCategory === "All" || s.service_category === selectedCategory)
                .map((service) => {
                const { icon: Icon, color } = getCategoryIconAndColor(service.service_category);
                const isSelected = selectedService?.service_id === service.service_id;
                
                return (
                  <button
                    key={service.service_id}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-all hover:scale-[1.03]",
                      isSelected
                        ? "bg-accent/10 border-accent shadow-card"
                        : "border-border hover:border-accent/40"
                    )}
                  >
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-center w-full">
                      <span className="block text-xs font-semibold text-foreground truncate w-full" title={service.service_name}>
                        {service.service_name}
                      </span>
                      <span className="block text-[10px] text-muted-foreground truncate w-full" title={service.provider_name}>
                        {service.provider_name}
                      </span>
                      <span className="mt-1 inline-block text-[10px] font-bold text-accent bg-accent/10 px-1.5 rounded">
                        Fee: ${service.fee}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* --- Pay Form --- */}
        <motion.div variants={fadeUp} custom={2} className="rounded-2xl border border-border bg-card p-5 shadow-card flex flex-col">
          <h3 className="mb-4 font-display font-semibold text-foreground">Payment Details</h3>
          
          <AnimatePresence mode="wait">
            {selectedService ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4 flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 rounded-xl border border-accent/20 bg-accent/5 p-3.5">
                  {(() => {
                    const { icon: Icon, color } = getCategoryIconAndColor(selectedService.service_category);
                    return (
                      <>
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", color)}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{selectedService.service_name}</p>
                          <p className="text-xs text-muted-foreground">{selectedService.provider_name}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div>
                  <Label className="text-xs font-medium text-foreground">Consumer Number / Account ID</Label>
                  <Input
                    className="mt-1.5 h-11"
                    placeholder="e.g. 1029384756"
                    value={consumerNumber}
                    onChange={(e) => setConsumerNumber(e.target.value)}
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-foreground">Amount ($)</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                    <Input
                      type="number"
                      className="h-11 pl-8"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full shadow-glow"
                    onClick={() => setPinOpen(true)}
                    disabled={payMutation.isPending || !consumerNumber || !amount || Number(amount) <= 0}
                  >
                    {payMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                      </div>
                    ) : (
                      <>Pay ${Number(amount).toFixed(2)} <ArrowRight className="ml-1 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-1 text-center min-h-[250px]"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mb-1 font-medium text-foreground">Select a service</p>
                <p className="text-sm text-muted-foreground">Choose from the grid to fill in payment details.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* --- Payment History Table --- */}
      <motion.div variants={fadeUp} custom={3} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-display font-semibold text-foreground">Payment History</h3>
          </div>
          <div className="flex max-w-xs flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                className="h-8 pl-9 text-xs"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Transaction ID", "Service", "Consumer #", "Amount", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingHistory ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((b, i) => (
                  <tr key={i} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{b.transaction_id || `TX-${i+1}`}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{b.service_name}</p>
                      <p className="text-xs text-muted-foreground">{b.provider_name}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{b.consumer_number || "N/A"}</td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">${Number(b.amount).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                        (b.status || b.transaction_status) === "success" || (b.status || b.transaction_status) === "completed" 
                          ? "bg-success/10 text-success border border-success/20" 
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}>
                        {b.status || b.transaction_status || "Completed"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No payment history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* --- PIN Verification Dialog --- */}
      <PinVerifyDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onVerified={(pin) => payMutation.mutate(pin)}
        description={`Enter your 6-digit TransPIN to pay $${Number(amount || 0).toFixed(2)} for ${selectedService?.service_name}.`}
      />
    </motion.div>
  );
}

export { BillsPage as default };
