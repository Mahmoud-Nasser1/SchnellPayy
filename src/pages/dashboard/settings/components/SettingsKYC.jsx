import { useState, useEffect } from "react";
import { Check, Shield, Upload, Clock, AlertCircle, FileText, ChevronRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import KycFileUpload from "./KycFileUpload";

const DOCUMENT_TYPES = [
  { id: "national_id", label: "National ID Card", description: "Standard government-issued ID card" },
  { id: "passport", label: "Passport", description: "International travel document" },
  { id: "driving_license", label: "Driving License", description: "Official driver's permit" },
];

export default function SettingsKYC() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [docType, setDocType] = useState("");
  const [uploads, setUploads] = useState({
    front: null,
    back: null,
    selfie: null,
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["kyc-status"],
    queryFn: async () => {
      const res = await api.get("/kyc/status");
      return res.data?.data || res.data;
    },
  });

  const kycStatus = statusData?.kyc_status || "not_submitted";

  const submitMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post("/kyc/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast({
        title: "Success",
        description: res.message || "KYC documents submitted!",
      });
      queryClient.invalidateQueries(["kyc-status"]);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to submit documents",
        variant: "destructive",
      });
    },
  });

  const handleKycSubmit = () => {
    if (!docType || !uploads.front || !uploads.back || !uploads.selfie) {
      toast({
        title: "Validation Error",
        description: "Please complete all fields and uploads",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("document_type", docType);
    formData.append("front_image", uploads.front);
    formData.append("back_image", uploads.back);
    formData.append("selfie_image", uploads.selfie);

    submitMutation.mutate(formData);
  };

  if (statusLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
        <p className="text-sm text-muted-foreground animate-pulse">Checking verification status...</p>
      </div>
    );
  }

  // State: APPROVED
  if (kycStatus === "approved") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="gradient-accent rounded-2xl p-6 text-accent-foreground shadow-glow flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Check className="h-10 w-10 text-white" />
          </div>
          <h3 className="font-display text-2xl font-bold mb-2">Identity Verified</h3>
          <p className="text-sm text-accent-foreground/90 max-w-sm">
            Your account is fully verified. You have full access to all features, higher limits, and priority support.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Verification Type</span>
            <span className="font-bold text-foreground">
              {DOCUMENT_TYPES.find(t => t.id === statusData.document_type)?.label || "Official Document"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Verified On</span>
            <span className="font-bold text-foreground">
              {statusData.verified_at ? new Date(statusData.verified_at).toLocaleDateString() : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold bg-emerald-500/10 p-3 rounded-lg justify-center uppercase tracking-widest">
            <Shield className="h-4 w-4" /> Trusted Account
          </div>
        </div>
      </div>
    );
  }

  // State: PENDING
  if (kycStatus === "pending") {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
            <Clock className="h-10 w-10 text-accent animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-foreground">Verification in Progress</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We are currently reviewing your documents. This usually takes 24–48 hours.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50 border border-border text-left">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-medium text-muted-foreground uppercase">Submitted Status</span>
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent font-bold uppercase tracking-tighter">In Review</span>
            </div>
            <div className="space-y-2">
              <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full bg-accent animate-shimmer" style={{ width: '60%' }} />
              </div>
              <p className="text-[10px] text-muted-foreground text-center italic">Waiting for manual approval by compliance team</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => queryClient.invalidateQueries(["kyc-status"])}>
            Refresh Status
          </Button>
        </div>
      </div>
    );
  }

  // State: NOT SUBMITTED or REJECTED
  return (
    <div className="space-y-6 animate-fade-in">
      {kycStatus === "rejected" && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">Verification Rejected</p>
            <p className="text-xs text-destructive/80 mt-1">
              {statusData.rejection_reason || "One or more documents were unclear or invalid. Please resubmit your information."}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="font-display font-semibold text-foreground">Identity Verification</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Complete your KYC to unlock full account features and higher limits.
          </p>
        </div>

        {/* Document Type Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select Document Type</label>
          <div className="grid grid-cols-1 gap-2">
            {DOCUMENT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setDocType(type.id)}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-xl border transition-all text-left",
                  docType === type.id 
                    ? "border-accent bg-accent/5 ring-1 ring-accent" 
                    : "border-border hover:border-accent/30 hover:bg-muted/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    docType === type.id ? "bg-accent text-white" : "bg-muted text-muted-foreground"
                  )}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{type.label}</p>
                    <p className="text-[10px] text-muted-foreground">{type.description}</p>
                  </div>
                </div>
                {docType === type.id && <Check className="h-5 w-5 text-accent" />}
              </button>
            ))}
          </div>
        </div>

        {docType && (
          <div className="space-y-5 animate-slide-up pt-2">
            <div className="space-y-4">
              <KycFileUpload
                label={`Photo of ${DOCUMENT_TYPES.find(t => t.id === docType)?.label || "Document"} (Front)`}
                onUpload={(f) => setUploads(u => ({ ...u, front: f }))}
              />
              <KycFileUpload
                label={`Photo of ${DOCUMENT_TYPES.find(t => t.id === docType)?.label || "Document"} (Back)`}
                onUpload={(f) => setUploads(u => ({ ...u, back: f }))}
              />
              <KycFileUpload
                label="Selfie with Document"
                onUpload={(f) => setUploads(u => ({ ...u, selfie: f }))}
              />
            </div>

            <div className="rounded-xl bg-muted/50 border border-border p-4 flex gap-3">
              <Shield className="h-5 w-5 text-accent shrink-0" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                We use secure 256-bit encryption to protect your data. Your identity documents are only used for verification purposes and are never shared with third parties.
              </p>
            </div>

            <Button
              variant="accent"
              className="w-full shadow-glow py-6"
              disabled={!uploads.front || !uploads.back || !uploads.selfie || submitMutation.isPending}
              onClick={handleKycSubmit}
            >
              {submitMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Submitting Documents...
                </div>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Submit for Verification
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
