import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeDown, stagger, fadeUp, scaleIn } from "@/lib/motion";
import { Copy, Check, QrCode, Share2 } from "lucide-react";
import QRCode from "react-qr-code";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAuthStore from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

function ReceiveMoneyPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const userData = user?.data || user || {};
  const username = userData?.user_name || "";

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");

  useEffect(() => {
    // Construct the URL dynamically
    const baseUrl = `${window.location.origin}/dashboard/send`;
    const params = new URLSearchParams();
    if (username) params.append("to", username);
    if (amount) params.append("amount", amount);
    if (note) params.append("note", note);
    
    setPaymentUrl(`${baseUrl}?${params.toString()}`);
  }, [username, amount, note]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Payment link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Send me money on SchnellPayy',
          text: `Pay me via SchnellPayy! ${amount ? `Amount: ${amount}` : ''}`,
          url: paymentUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-md space-y-6"
    >
      <motion.div variants={fadeDown} custom={0}>
        <h1 className="font-display text-2xl font-bold text-foreground">Receive Money</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a payment link or QR code to receive funds instantly.
        </p>
      </motion.div>

      {/* QR Code Card */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="space-y-6 rounded-2xl border border-border bg-card p-6 text-center shadow-card"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scan to Pay
          </p>
          <h3 className="mt-1 font-display text-xl font-bold text-foreground">
            @{username}
          </h3>
        </div>

        <motion.div variants={scaleIn} custom={0} className="relative mx-auto flex h-52 w-52 items-center justify-center rounded-2xl border border-border bg-white shadow-inner p-3">
          {paymentUrl && (
            <QRCode
              value={paymentUrl}
              size={180}
              level="H"
              className="h-full w-full"
            />
          )}
          {/* glow ring */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-accent/20 blur-sm" />
        </motion.div>

        {/* Link Actions */}
        <motion.div variants={fadeUp} custom={1}>
          <p className="mb-2 text-xs font-medium text-muted-foreground text-left">
            Payment Link
          </p>
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
            <code className="font-mono text-xs font-semibold tracking-wide text-foreground truncate max-w-[200px]">
              {paymentUrl}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-accent ml-2 shrink-0"
            >
              {copied ? (
                <><Check className="h-4 w-4 text-accent" />Copied</>
              ) : (
                <><Copy className="h-4 w-4" />Copy</>
              )}
            </button>
          </div>
        </motion.div>
        
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-background p-3 text-sm font-medium text-muted-foreground transition-all hover:border-accent/40 hover:text-accent hover:shadow-sm"
        >
          <Share2 className="h-4 w-4" /> Share Link
        </button>
      </motion.div>

      {/* Customize Request */}
      <motion.div
        variants={fadeUp}
        custom={2}
        className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4"
      >
        <h3 className="font-display font-semibold text-foreground">Customize Request (Optional)</h3>
        
        <div>
          <Label className="text-xs text-muted-foreground">Amount</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Note / Description</Label>
          <Input
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export { ReceiveMoneyPage as default };
