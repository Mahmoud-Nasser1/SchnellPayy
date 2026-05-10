import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Plus,
  ArrowRight,
  Check,
  Lock,
  X,
  Smartphone,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, fadeIn, scaleUp, stagger } from "@/lib/motion";
import { useToast } from "@/hooks/use-toast";
import PinVerifyDialog from "@/components/PinVerifyDialog";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";

// AddMethodModal handles adding cards/wallets
function AddMethodModal({ onClose }) {
  const [tab, setTab] = useState("card");
  const [form, setForm] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
    phone: "",
    providerName: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCardMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        providerName: "Visa", // Mocked for now, or derived from regex
        cardNumber: form.number.replace(/\s/g, ""),
        expiryDate: form.expiry,
        cardHolderName: form.name,
        gatewayToken: "tok_" + Math.random().toString(36).substring(7),
      };
      const res = await api.post("/payment-methods/card", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payment-methods"]);
      toast({ title: "Card Added", description: "Your card was successfully linked." });
      onClose();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add card", variant: "destructive" });
    }
  });

  const addWalletMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        providerName: form.providerName || "Mobile Wallet",
        phoneNumber: form.phone,
      };
      const res = await api.post("/payment-methods/mobile", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["payment-methods"]);
      toast({ title: "Wallet Added", description: "Your mobile wallet was successfully linked." });
      onClose();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add wallet", variant: "destructive" });
    }
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  
  const handleAdd = (e) => {
    e.preventDefault();
    if (tab === "card") addCardMutation.mutate();
    else if (tab === "wallet") addWalletMutation.mutate();
  };

  const loading = addCardMutation.isPending || addWalletMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lifted"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-foreground">
            Add Payment Method
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Type tabs (Bank removed) */}
        <div className="mb-5 flex gap-2 rounded-xl bg-muted p-1">
          {["card", "wallet"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold capitalize transition-all",
                tab === t
                  ? "bg-card text-foreground shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "card" && <CreditCard className="h-3.5 w-3.5" />}
              {t === "wallet" && <Smartphone className="h-3.5 w-3.5" />}
              {t === "card" ? "Credit/Debit Card" : "Mobile Wallet"}
            </button>
          ))}
        </div>
        <form onSubmit={handleAdd} className="space-y-4">
          {tab === "card" && (
            <>
              <div>
                <Label className="text-xs font-medium text-foreground">Card Number</Label>
                <Input
                  className="mt-1.5 h-11"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={form.number}
                  onChange={(e) =>
                    update(
                      "number",
                      e.target.value
                        .replace(/\D/g, "")
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground">Cardholder Name</Label>
                <Input
                  className="mt-1.5 h-11"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Expiry (MM/YY)</Label>
                  <Input
                    className="mt-1.5 h-11"
                    placeholder="12/28"
                    maxLength={5}
                    value={form.expiry}
                    onChange={(e) =>
                      update(
                        "expiry",
                        e.target.value
                          .replace(/\D/g, "")
                          .replace(/^(.{2})(.+)$/, "$1/$2")
                          .slice(0, 5),
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">CVV</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="password"
                      className="h-11"
                      placeholder="•••"
                      maxLength={4}
                      value={form.cvv}
                      onChange={(e) =>
                        update("cvv", e.target.value.replace(/\D/g, ""))
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              {form.number && (
                <div className="gradient-card rounded-xl p-4 text-xs text-primary-foreground/90">
                  <p className="mb-1 font-mono text-base tracking-widest">
                    {form.number ||
                      "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022"}
                  </p>
                  <div className="flex justify-between">
                    <span>{form.name || "CARDHOLDER NAME"}</span>
                    <span>{form.expiry || "MM/YY"}</span>
                  </div>
                </div>
              )}
            </>
          )}
          {tab === "wallet" && (
            <>
              <div>
                <Label className="text-xs font-medium text-foreground">Provider Name</Label>
                <Input
                  className="mt-1.5 h-11"
                  placeholder="e.g. Vodafone Cash"
                  value={form.providerName}
                  onChange={(e) => update("providerName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground">Mobile Number</Label>
                <Input
                  className="mt-1.5 h-11"
                  placeholder="+2010..."
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span>Your details are encrypted with 256-bit SSL. We never store CVV.</span>
          </div>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            className="w-full shadow-glow"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Adding…
              </div>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add {tab === "card" ? "Card" : "Wallet"}
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function FundsPage() {
  const [selectedMethodId, setSelectedMethodId] = useState(null);
  const [amount, setAmount] = useState("");
  const [done, setDone] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const { toast } = useToast();
  
  const queryClient = useQueryClient();
  const { fetchMe } = useAuthStore();

  const { data: methods = [], isLoading: loadingMethods } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await api.get("/payment-methods");
      return res.data?.data || [];
    },
  });

  const depositMutation = useMutation({
    mutationFn: async (pin) => {
      const payload = {
        method_id: selectedMethodId,
        amount: Number(amount),
        transaction_pin: pin,
      };
      const res = await api.post("/wallet/deposit", payload);
      return res.data;
    },
    onSuccess: async (data) => {
      if (data.success || data.status === "success") {
        setPinOpen(false);
        setSuccessData(data.data);
        setDone(true);
        await fetchMe();
      } else {
        toast({ title: "Deposit Failed", description: data.message || "Something went wrong.", variant: "destructive" });
      }
    },
    onError: (err) => {
      toast({ title: "Deposit Failed", description: err.response?.data?.message || "Transaction failed.", variant: "destructive" });
    }
  });

  // Set default selection
  if (!selectedMethodId && methods.length > 0) {
    const def = methods.find(m => m.is_default) || methods[0];
    setSelectedMethodId(def.method_id);
  }

  return (
    <>
      <AnimatePresence>
        {showAdd && <AddMethodModal onClose={() => setShowAdd(false)} />}
        {done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lifted"
            >
              <div className="gradient-success mx-auto mb-6 flex h-20 w-20 animate-bounce-in items-center justify-center rounded-full shadow-glow">
                <Check className="h-10 w-10 text-accent-foreground" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Deposit Successful!</h2>
              <p className="mb-4 text-muted-foreground">
                <span className="text-lg font-bold text-accent">${Number(amount).toFixed(2)}</span> has been added to your wallet.
              </p>
              {successData?.reference && (
                <div className="mb-6 rounded-xl bg-muted/50 p-4 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Transaction Reference</p>
                  <p className="font-mono text-sm font-semibold text-foreground tracking-wider">{successData.reference}</p>
                </div>
              )}
              <Button type="button" variant="accent" className="w-full shadow-glow" onClick={() => { setDone(false); setAmount(""); setSuccessData(null); }}>
                Done
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div variants={stagger} initial="hidden" animate="visible" className="mx-auto max-w-lg space-y-6">
        <motion.div variants={fadeUp} custom={0}>
          <h1 className="font-display text-2xl font-bold text-foreground">Deposit</h1>
          <p className="mt-1 text-sm text-muted-foreground">Add money to your wallet securely</p>
        </motion.div>
        
        {/* Amount */}
        <motion.div variants={fadeUp} custom={2} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <div>
            <Label className="text-xs font-medium text-foreground">Amount</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
              <Input
                type="number"
                placeholder="0.00"
                className="h-16 pl-10 font-display text-2xl font-bold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {["50", "100", "500", "1000"].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q)}
                className={cn(
                  "rounded-lg border py-2 text-sm font-semibold transition-all",
                  amount === q
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
                )}
              >
                ${q}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div variants={fadeUp} custom={3} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-foreground">From Payment Method</h3>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 text-xs font-semibold text-accent transition-opacity hover:underline hover:opacity-80"
            >
              <Plus className="h-3 w-3" /> Add new
            </button>
          </div>
          <div className="space-y-2">
            {loadingMethods ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : methods.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-muted/30 border border-dashed border-border">
                <p className="text-sm text-muted-foreground">No payment methods added yet.</p>
              </div>
            ) : (
              methods.map((m) => {
                const isSelected = selectedMethodId === m.method_id;
                const isCard = m.method_type === "card";
                const Icon = isCard ? CreditCard : Smartphone;
                const color = isCard ? "text-blue-500 bg-blue-500/10" : "text-purple-500 bg-purple-500/10";
                
                // Details depending on card or mobile wallet
                const last4 = isCard ? m.card_number?.slice(-4) : m.phone_number?.slice(-4);
                
                return (
                  <button
                    key={m.method_id}
                    type="button"
                    onClick={() => setSelectedMethodId(m.method_id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                      isSelected
                        ? "bg-accent/8 border-accent shadow-card"
                        : "border-border hover:border-accent/40 hover:bg-muted/30",
                    )}
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground">
                        {m.provider_name} •••• {last4 || "****"}
                      </span>
                    </div>
                    {m.is_default && (
                      <span className="bg-accent/12 rounded-full border border-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                        Default
                      </span>
                    )}
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" />}
                  </button>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Security note */}
        <motion.div variants={fadeIn} custom={4} className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-accent" />
          <span>256-bit SSL encryption · PCI DSS Level 1 certified · Funds guaranteed</span>
        </motion.div>

        <motion.div variants={fadeUp} custom={5}>
          <Button
            type="button"
            variant="accent"
            size="lg"
            className="group relative h-12 w-full overflow-hidden rounded-xl text-base font-semibold shadow-glow transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            onClick={() => setPinOpen(true)}
            disabled={!amount || Number(amount) <= 0 || depositMutation.isPending || !selectedMethodId}
          >
            {depositMutation.isPending ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing secure transaction…
              </div>
            ) : (
              <span className="flex items-center gap-2">
                Deposit <span className="font-bold">${amount || "0.00"}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            )}
            <span className="absolute inset-0 bg-white/5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Button>
        </motion.div>
      </motion.div>

      <PinVerifyDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onVerified={(pin) => depositMutation.mutate(pin)}
        description={`Enter your 6-digit TransPIN to deposit $${Number(amount || 0).toFixed(2)}.`}
      />
    </>
  );
}
export { FundsPage as default };
