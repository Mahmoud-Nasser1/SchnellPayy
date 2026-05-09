import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
  ArrowLeft,
  ArrowRight,
  KeyRound,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

function ForgotPasswordPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(45);
  
  const navigate = useNavigate();
  const inputs = useRef([]);

  useEffect(() => {
    if (step === "otp") inputs.current[0]?.focus();
  }, [step]);

  useEffect(() => {
    if (timer <= 0 || step !== "otp") return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, step]);

  const sendOTP = async (e) => {
    e?.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      const res = await api.post("/auth/forget-password", { email });
      toast.success(res.data.message || "OTP sent to your email");
      setStep("otp");
      setTimer(45);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;
    try {
      await api.post("/auth/resend-otp", { email, type: "reset" });
      toast.success("OTP resent to your email");
      setTimer(45);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;

    const next = [...otp];
    next[i] = val;
    setOtp(next);
    setError("");

    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const verifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) return;

    setLoading(true);
    try {
      const res = await api.post("/auth/verify-reset-otp", { email, otp: code });
      toast.success(res.data.message || "OTP verified");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid verification code");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xl font-bold"
          >
            <div className="gradient-accent flex h-9 w-9 items-center justify-center rounded-xl shadow-glow">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            Schnell<span className="text-accent">Pay</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          {/* EMAIL STEP */}
          {step === "email" && (
            <>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <Mail className="h-6 w-6 text-accent" />
              </div>

              <h1 className="text-2xl font-bold">Forgot Password</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Enter your email to receive a secure OTP
              </p>

              <form onSubmit={sendOTP} className="space-y-4">
                <div>
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    className="mt-2 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  className="h-11 w-full shadow-glow"
                  variant="accent"
                  disabled={loading || !email}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}

          {/* OTP STEP */}
          {step === "otp" && (
            <>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <KeyRound className="h-6 w-6 text-accent" />
              </div>

              <h1 className="text-2xl font-bold">OTP CODE</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Enter the 6-digit secure code sent to {email}
              </p>

              {/* PIN INPUTS (PRO STYLE) */}
              <div className="mb-4 flex justify-between gap-2">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    value={d}
                    maxLength={1}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        inputs.current[i - 1]?.focus();
                      }
                    }}
                    className={`
                      h-14 w-12 rounded-xl border text-center text-lg font-bold
                      bg-background transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-accent/40
                      ${error ? "border-red-500" : "border-border"}
                      ${d ? "border-accent shadow-glow" : ""}
                    `}
                  />
                ))}
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-3 flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {error}
                </div>
              )}

              {/* VERIFY BUTTON */}
              <Button
                onClick={verifyOTP}
                className="h-11 w-full shadow-glow"
                variant="accent"
                disabled={otp.join("").length < 6 || loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                    Verifying...
                  </div>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              {/* TIMER */}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {timer > 0 ? (
                  <>Resend in 0:{String(timer).padStart(2, "0")}</>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="mx-auto flex items-center gap-1 text-accent hover:underline"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* BACK */}
        <div className="mt-5 text-center">
          <Link
            to="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 inline h-3 w-3" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
