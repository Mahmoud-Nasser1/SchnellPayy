import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeDown, stagger } from "@/lib/motion";
import PinVerifyDialog from "@/components/PinVerifyDialog";
import { useSearchParams } from "react-router-dom";

import SendStepsProgress from "./components/SendStepsProgress";
import SendRecipientStep from "./components/SendRecipientStep";
import SendAmountStep from "./components/SendAmountStep";
import SendReviewStep from "./components/SendReviewStep";
import SendSuccess from "./components/SendSuccess";
import { useToast } from "@/hooks/use-toast";
import useAuthStore from "@/store/authStore";
import api from "@/lib/api";

// No mock data needed, we only use live search now

function SendMoneyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTo = searchParams.get("to");
  const initialAmount = searchParams.get("amount");
  const initialNote = searchParams.get("note");

  const [step, setStep] = useState(initialTo ? "amount" : "recipient");
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(initialAmount || "");
  const [note, setNote] = useState(initialNote || "");
  const [loading, setLoading] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  const { fetchMe } = useAuthStore();
  const { toast } = useToast();

  // Auto-resolve recipient if linked
  useEffect(() => {
    if (initialTo && !selected) {
      api.get(`/users/search?q=${initialTo}`).then(res => {
        const users = res.data?.data?.users || [];
        const match = users.find(u => u.user_name.toLowerCase() === initialTo.toLowerCase());
        if (match) {
          setSelected({
            id: match.user_name,
            name: match.full_name,
            username: match.user_name,
            verified: match.is_verified,
            avatar: (match.full_name || "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
          });
        } else {
          // If not found, fallback to search step
          setStep("recipient");
          toast({
            title: "User not found",
            description: `Could not find a user matching '@${initialTo}'`,
            variant: "destructive",
          });
        }
      }).catch(err => {
        setStep("recipient");
      });
    }
  }, [initialTo, selected, toast]);

  const handleSend = async (pin) => {
    setLoading(true);
    try {
      const payload = {
        receiver_username: selected.username,
        amount: Number(amount),
        description: note || `Transfer to ${selected.name}`,
        transaction_pin: pin
      };

      const res = await api.post("/transactions/send", payload);
      
      if (res.data.success) {
        setTransactionData(res.data.data);
        toast({
          title: "Transfer Successful",
          description: `Sent ${Number(amount).toFixed(2)} to ${selected.name}`,
        });
        await fetchMe(); // Refresh balance
        setStep("success");
      }
    } catch (err) {
      toast({
        title: "Transfer Failed",
        description: err.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Recipient", "Amount", "Confirm"];
  const stepIndex = { recipient: 0, amount: 1, confirm: 2, success: 3 };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-lg space-y-6"
    >
      <motion.div variants={fadeDown} custom={0}>
        <h1 className="font-display text-2xl font-bold text-foreground">Send Money</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fast, secure transfers to anyone worldwide
        </p>
      </motion.div>

      <SendStepsProgress step={step} steps={steps} stepIndex={stepIndex} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          {step === "recipient" && (
            <SendRecipientStep
              selected={selected}
              setSelected={setSelected}
              setStep={setStep}
            />
          )}

          {step === "amount" && selected && (
            <SendAmountStep
              selected={selected}
              amount={amount}
              setAmount={setAmount}
              note={note}
              setNote={setNote}
              setStep={setStep}
            />
          )}

          {step === "confirm" && selected && (
            <SendReviewStep
              selected={selected}
              amount={amount}
              note={note}
              loading={loading}
              setPinOpen={setPinOpen}
              setStep={setStep}
            />
          )}

          {step === "success" && selected && (
            <SendSuccess
              selected={selected}
              amount={amount}
              transactionData={transactionData}
              setStep={setStep}
              setSelected={setSelected}
              setAmount={setAmount}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <PinVerifyDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        onVerified={handleSend}
        description={`Enter your 6-digit TransPIN to send $${Number(amount || 0).toFixed(2)}.`}
      />
    </motion.div>
  );
}
export { SendMoneyPage as default };
