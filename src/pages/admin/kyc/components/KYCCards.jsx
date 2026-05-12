import { Check, X, Eye, FileCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const getBaseHost = () => {
  const url = api.defaults.baseURL;
  if (!url) return "https://schnell-pay-back-end.vercel.app";
  // Remove /api/v1 or similar from the end
  return url.replace(/\/api\/v1\/?$/, "").replace(/\/api\/?$/, "");
};

export function KYCCards({ records, loading, onApprove, onReject }) {
  const baseHost = getBaseHost();

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-12 text-center">
        <p className="text-muted-foreground">No KYC submissions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((kyc, i) => (
        <motion.div
          key={kyc.KYC_ID}
          variants={fadeUp}
          custom={i}
          className={cn(
            "rounded-2xl border bg-card p-5 shadow-card transition-all",
            kyc.KYC_status === "approved"
              ? "border-accent/40 bg-accent/5"
              : kyc.KYC_status === "rejected"
                ? "border-destructive/40 bg-destructive/5"
                : "border-border",
          )}
        >
          <div className="flex items-start gap-4">
            <div className="gradient-card flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-primary-foreground">
              {kyc.f_name?.[0]}
              {kyc.l_name?.[0]}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">
                    {kyc.f_name} {kyc.l_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {kyc.email} · Submitted{" "}
                    {new Date(
                      kyc.verified_at || kyc.created_at || Date.now(),
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                    kyc.KYC_status === "approved"
                      ? "badge-success"
                      : kyc.KYC_status === "rejected"
                        ? "badge-danger"
                        : "badge-info",
                  )}
                >
                  {kyc.KYC_status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Front ID", path: kyc.front_image },
                  { label: "Back ID", path: kyc.back_image },
                  { label: "Selfie", path: kyc.selfie_image },
                ].map((doc) => {
                  const normalizedPath = doc.path
                    ? doc.path.replace(/\\/g, "/").replace(/^\/?/, "/")
                    : null;

                  const imageUrl = normalizedPath
                    ? normalizedPath.startsWith("http")
                      ? normalizedPath
                      : `${baseHost}${normalizedPath}`
                    : null;

                  return (
                    <Dialog key={doc.label}>
                      <DialogTrigger asChild>
                        <button className="flex items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground">
                          <FileCheck className="h-3 w-3" /> {doc.label}{" "}
                          <Eye className="ml-0.5 h-3 w-3" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>
                            {kyc.f_name} {kyc.l_name} - {doc.label}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 overflow-hidden rounded-xl border border-border flex flex-col items-center justify-center bg-muted/50 p-2">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={doc.label}
                              className="w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-kyc.png";
                              }}
                            />
                          ) : (
                            <div className="py-8 text-center text-xs text-muted-foreground">
                              No image file provided.
                            </div>
                          )}
                          <p className="mt-2 text-[10px] text-muted-foreground truncate w-full text-center px-4">
                            {imageUrl || "No path available"}
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>

              <AnimatePresence>
                {kyc.KYC_status === "pending" && (
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
                      onClick={() => onApprove(kyc)}
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onReject(kyc)}
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {kyc.KYC_status === "rejected" && kyc.rejection_reason && (
                <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-2 text-xs text-destructive">
                  <span className="font-bold">Reason:</span>{" "}
                  {kyc.rejection_reason}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
