import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Smartphone,
  KeyRound,
  CheckCircle2,
  Mail,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeUp, fadeDown, stagger } from "@/lib/motion";
import { toast } from "sonner";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";

function TwoFactorVerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, fetchMe } = useAuthStore();

  // Get data from login page redirect
  const { username, method, mfa_token } = location.state || {};

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    if (!mfa_token || !username) {
      toast.error("Invalid session. Please login again.");
      navigate("/login");
      return;
    }

    // If method is email, trigger the OTP send
    if (method === "email" && timer === 0 && !useBackupCode) {
      handleResend();
    }
    
    if (!useBackupCode) {
      inputs.current[0]?.focus();
    }
  }, [isAuthenticated, mfa_token, username, method, navigate, useBackupCode]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleChange = (i, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[i] = value;
    setOtp(next);
    setError("");
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === 6) {
      handleVerify();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = useBackupCode ? backupCode : otp.join("");
    if (code.length < (useBackupCode ? 8 : 6)) return;

    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/2fa/validate", {
        mfa_token,
        code,
      });

      if (res.data.success) {
        setVerified(true);
        toast.success(res.data.message || "MFA Verified");
        
        // Save token and fetch user
        login(null, res.data.token);
        await fetchMe();
        
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
      setError(err.response?.data?.message || "Invalid code");
      if (!useBackupCode) {
        setOtp(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resending || (method === "email" && timer > 0)) return;
    
    setResending(true);
    try {
      const res = await api.post("/auth/2fa/send-otp", { username });
      toast.success(res.data.message || "A new code has been sent to your email.");
      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      inputs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const isActuallyVerified = verified || isAuthenticated;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div variants={fadeDown} custom={0} className="mb-8 text-center">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 font-display text-xl font-bold"
          >
            <div className="gradient-accent flex h-8 w-8 items-center justify-center rounded-lg shadow-glow">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            Schnell<span className="text-accent">Pay</span>
          </Link>

          {isActuallyVerified ? (
            <div className="animate-bounce-in">
              <div className="gradient-accent mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full shadow-glow">
                <CheckCircle2 className="h-10 w-10 text-accent-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold">Verified!</h2>
              <p className="mt-1 text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="gradient-card mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-navy">
                {useBackupCode ? (
                  <KeyRound className="h-8 w-8 text-accent" />
                ) : method === "app" ? (
                  <Smartphone className="h-8 w-8 text-accent" />
                ) : (
                  <Mail className="h-8 w-8 text-accent" />
                )}
              </div>

              <h1 className="mb-2 font-display text-3xl font-bold">
                {useBackupCode ? "Backup Code" : "Two-factor authentication"}
              </h1>

              <p className="text-sm text-muted-foreground px-6">
                {useBackupCode
                  ? "Enter one of your 10-character backup codes"
                  : method === "app"
                    ? "Enter the 6-digit code from your authenticator app"
                    : `Enter the 6-digit code we sent to your registered email`}
              </p>
            </>
          )}
        </motion.div>

        {!isActuallyVerified && (
          <>
            {/* Input Selection */}
            {!useBackupCode ? (
              <motion.div
                variants={fadeUp}
                custom={1}
                className="mb-3 flex justify-center gap-2 sm:gap-3"
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={cn(
                      "h-14 w-11 rounded-xl border-2 bg-card text-center text-xl font-bold transition-all sm:w-12 focus:outline-none",
                      error
                        ? "border-destructive text-destructive"
                        : digit
                          ? "border-accent text-accent shadow-glow"
                          : "border-border focus:border-accent/50",
                    )}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div variants={fadeUp} custom={1} className="mb-4">
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter 10-character code"
                    value={backupCode}
                    onChange={(e) => {
                      setBackupCode(e.target.value.toUpperCase());
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    className={cn(
                      "h-14 w-full rounded-xl border-2 bg-card pl-10 text-center text-lg font-mono font-bold tracking-widest transition-all focus:outline-none",
                      error
                        ? "border-destructive text-destructive"
                        : backupCode
                          ? "border-accent text-accent shadow-glow"
                          : "border-border focus:border-accent/50",
                    )}
                  />
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.p className="mb-4 flex items-center justify-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.p>
            )}

            {/* Verify Button */}
            <motion.div variants={fadeUp} custom={2}>
              <Button
                variant="accent"
                size="lg"
                className="mb-3 w-full shadow-glow"
                onClick={handleVerify}
                disabled={
                  (useBackupCode ? backupCode.length < 8 : otp.join("").length < 6) ||
                  loading
                }
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    Verify & continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Options Toggle */}
            <motion.div variants={fadeUp} custom={3} className="text-center">
              <button
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setError("");
                }}
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                {useBackupCode ? (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    Back to {method === "app" ? "App" : "Email"}
                  </>
                ) : (
                  <>
                    Lost access? Use a backup code
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </motion.div>

            {/* Resend (Only for Email Mode) */}
            {!useBackupCode && method === "email" && (
              <motion.div variants={fadeUp} custom={4} className="mt-4 text-center">
                {timer > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend code in{" "}
                    <span className="font-semibold text-foreground">
                      0:{String(timer).padStart(2, "0")}
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
                  >
                    <RefreshCw
                      className={cn("h-4 w-4", resending && "animate-spin")}
                    />
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                )}
              </motion.div>
            )}

            <motion.p className="mt-6 text-center text-xs text-muted-foreground">
              Having trouble?{" "}
              <Link to="/login" className="text-accent hover:underline">
                Back to login
              </Link>
            </motion.p>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default TwoFactorVerifyPage;
