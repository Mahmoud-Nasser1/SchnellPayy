import { useState } from "react";
import { Check, X, Eye, FileCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeDown, fadeUp, scaleIn, stagger } from "@/lib/motion";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
const kycList = [
  {
    id: 1,
    name: "Carlos Rivera",
    email: "carlos@example.com",
    country: "MX",
    submitted: "Jul 2, 2025",
    status: "pending",
    docs: ["Front ID Card", "Back ID Card", "Selfie"],
  },
  {
    id: 2,
    name: "Liu Wei",
    email: "liu@example.com",
    country: "CN",
    submitted: "Jul 5, 2025",
    status: "pending",
    docs: ["Front ID Card", "Back ID Card", "Selfie", "Address Proof"],
  },
  {
    id: 3,
    name: "Maria Santos",
    email: "maria@example.com",
    country: "BR",
    submitted: "Jul 6, 2025",
    status: "review",
    docs: ["Front ID Card", "Back ID Card", "Selfie"],
  },
  {
    id: 4,
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    country: "EG",
    submitted: "Jul 7, 2025",
    status: "pending",
    docs: ["Front ID Card", "Back ID Card", "Selfie"],
  },
];
function AdminKYC() {
  const [statuses, setStatuses] = useState(
    Object.fromEntries(kycList.map((k) => [k.id, k.status])),
  );
  const { toast } = useToast();
  const approve = (id, name) => {
    setStatuses((s) => ({ ...s, [id]: "approved" }));
    toast({ title: "KYC Approved", description: `${name}'s identity has been verified.` });
  };
  const reject = (id, name) => {
    setStatuses((s) => ({ ...s, [id]: "rejected" }));
    toast({
      title: "KYC Rejected",
      description: `${name}'s verification was rejected.`,
      variant: "destructive",
    });
  };

  const getDocImage = (docName) => {
    const lowerDoc = docName.toLowerCase();
    if (lowerDoc.includes("selfie")) return "/images/kyc/selfie.png";
    if (lowerDoc.includes("back")) return "/images/kyc/id_back.png";
    return "/images/kyc/id_front.png";
  };
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeDown} custom={0}>
        <h1 className="font-display text-2xl font-bold text-foreground">KYC Approval</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and approve identity verification requests
        </p>
      </motion.div>
      <motion.div variants={stagger} className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Pending Review",
            value: kycList.filter((k) => statuses[k.id] === "pending").length,
            color: "text-warning",
          },
          {
            label: "Approved Today",
            value: Object.values(statuses).filter((s) => s === "approved").length,
            color: "text-accent",
          },
          {
            label: "Rejected Today",
            value: Object.values(statuses).filter((s) => s === "rejected").length,
            color: "text-destructive",
          },
        ].map(({ label, value, color }, i) => (
          <motion.div
            key={label}
            variants={scaleIn}
            custom={i}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-card"
          >
            <p className={cn("font-display text-3xl font-bold", color)}>{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div variants={stagger} className="space-y-4">
        {kycList.map((kyc, i) => {
          const status = statuses[kyc.id];
          return (
            <motion.div
              key={kyc.id}
              variants={fadeUp}
              custom={i}
              className={cn(
                "rounded-2xl border bg-card p-5 shadow-card transition-all",
                status === "approved"
                  ? "border-accent/40 bg-accent/5"
                  : status === "rejected"
                    ? "border-destructive/40 bg-destructive/5"
                    : "border-border",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="gradient-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
                  {kyc.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{kyc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {kyc.email} · {kyc.country} · Submitted {kyc.submitted}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        status === "approved"
                          ? "badge-success"
                          : status === "rejected"
                            ? "badge-danger"
                            : status === "review"
                              ? "badge-warning"
                              : "badge-info",
                      )}
                    >
                      {status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {kyc.docs.map((doc) => (
                      <Dialog key={doc}>
                        <DialogTrigger asChild>
                          <button
                            className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                          >
                            <FileCheck className="h-3 w-3" /> {doc} <Eye className="ml-0.5 h-3 w-3" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>{kyc.name} - {doc}</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 overflow-hidden rounded-xl border border-border flex items-center justify-center bg-muted/50 p-2">
                            <img 
                              src={getDocImage(doc)} 
                              alt={doc} 
                              className="w-full max-h-[60vh] object-contain rounded-lg" 
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                  <AnimatePresence>
                    {(status === "pending" || status === "review") && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 flex gap-2"
                      >
                        <Button
                          size="sm"
                          variant="accent"
                          className="gap-1.5 shadow-glow"
                          onClick={() => approve(kyc.id, kyc.name)}
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => reject(kyc.id, kyc.name)}
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1.5 text-warning">
                          <AlertCircle className="h-3.5 w-3.5" /> Request More Docs
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
export { AdminKYC as default };
