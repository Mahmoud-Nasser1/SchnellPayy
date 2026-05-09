import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

function OtpVerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      toast.error("No email found. Please login or register first.");
      navigate("/login");
    }
    inputs.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1e3);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;
    
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { email, otp: otpValue });
      
      if (res.data.success) {
        toast.success(res.data.message || "Email verified successfully");
        setVerified(true);
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-otp", { email, type: "verify" });
      toast.success("OTP resent to your email");
      setTimer(59);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 font-display text-xl font-bold"
          >
            <div className="gradient-accent flex h-8 w-8 items-center justify-center rounded-lg shadow-glow">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            Secure<span className="text-accent">Wallet</span>
          </Link>
          {verified ? (
            <div className="animate-bounce-in">
              <div className="gradient-accent mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-glow">
                <svg
                  className="h-10 w-10 text-accent-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">Verified!</h2>
              <p className="mt-1 text-muted-foreground">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="gradient-card mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-navy">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
                Verify your email
              </h1>
              <p className="text-muted-foreground">
                We sent a 6-digit code to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </>
          )}
        </div>
        {!verified && (
          <>
            {/* OTP Input */}
            <div className="mb-8 flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={cn(
                    "h-14 w-12 rounded-xl border-2 bg-card text-center text-xl font-bold transition-all duration-200 focus:outline-none",
                    digit
                      ? "border-accent text-accent shadow-glow"
                      : "border-border text-foreground focus:border-accent/50",
                  )}
                />
              ))}
            </div>
            <Button
              variant="accent"
              size="lg"
              className="mb-4 w-full shadow-glow"
              onClick={handleVerify}
              disabled={otp.join("").length < 6 || loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                  Verifying...
                </div>
              ) : (
                <>
                  Verify Code <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    0:{String(timer).padStart(2, "0")}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Resend verification code
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export { OtpVerifyPage as default };
