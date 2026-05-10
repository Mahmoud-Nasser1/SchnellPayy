import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Fingerprint,
  TrendingUp,
  CheckCircle,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";
import { motion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import { toast } from "sonner";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import axios from "axios";

const highlights = [
  { icon: Shield, label: "256-bit SSL Encryption" },
  { icon: CheckCircle, label: "Real-time fraud monitoring" },
  { icon: Fingerprint, label: "Biometric authentication" },
  { icon: TrendingUp, label: "Smart analytics & insights" },
];

const recentTx = [
  { name: "Netflix", amount: "-$15.99", color: "text-red-500" },
  {
    name: "Salary Deposit",
    amount: "+$5,200",
    color: "text-emerald-500 dark:text-accent",
  },
  { name: "Amazon", amount: "-$89.99", color: "text-red-500" },
];

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";
  const { theme, toggleTheme } = useTheme();
  
  const login = useAuthStore((state) => state.login);
  const fetchMe = useAuthStore((state) => state.fetchMe);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post("/auth/login", { email, password });
      
      // Handle MFA verification requirement
      if (res.data.requires2FA) {
        toast.info(res.data.message);
        // Redirect to 2FA page and pass the response data as state
        navigate("/2fa", { state: { ...res.data.data, from } });
        return;
      }
      
      // Handle successful login directly
      if (res.data.success && res.data.token) {
        toast.success(res.data.message || "Logged in successfully");
        login(null, res.data.token);
        await fetchMe();
        navigate(from);
      }
      
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData) {
        if (!errorData.success && errorData.message === "Please verify your email before logging in.") {
          toast.error(errorData.message);
          // Redirect to OTP verification passing the email
          navigate("/otp-verify", { state: { email } });
        } else {
          toast.error(errorData.message || "Login failed");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-background transition-colors duration-300">
      {/* ── Left Panel (Hero Section) ── */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="gradient-hero relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[45%] xl:w-[50%]"
      >
        {/* Background Accents */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-[100px]" />
          <div
            className="absolute bottom-0 left-0 h-full w-full opacity-[0.05]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        {/* Logo */}
        <Link
          to="/"
          className="relative z-10 flex items-center gap-2.5 font-display text-2xl font-bold text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <Shield className="h-5 w-5 text-accent" />
          </div>
          Schnell<span className="text-accent">Pay</span>
        </Link>

        {/* Content */}
        <div className="relative z-10 space-y-10">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.h2
              variants={fadeUp}
              className="text-5xl font-extrabold leading-tight text-white tracking-tight"
            >
              Master your <br />
              <span className="text-accent underline decoration-white/20 underline-offset-8">
                digital wealth
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 max-w-md text-lg text-white/70 leading-relaxed"
            >
              Experience the next generation of secure payments and smart
              financial management.
            </motion.p>
          </motion.div>

          {/* Highlights */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {highlights.map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 backdrop-blur-sm border border-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium text-white/90">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Floating Live Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-xs rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Available Balance
                </p>
                <h3 className="text-3xl font-bold">$48,250.00</h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </div>
            </div>
            <div className="space-y-3">
              {recentTx.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-t border-white/5 pt-3"
                >
                  <span className="text-xs text-white/60">{tx.name}</span>
                  <span
                    className={`text-xs font-bold ${tx.color.includes("emerald") ? "text-emerald-400" : "text-white"}`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Right Panel (Login Form) ── */}
      <div className="relative flex flex-1 flex-col items-center justify-center p-8 lg:p-12">
        {/* Theme Toggle */}
        <div className="absolute right-8 top-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] space-y-8"
        >
          {/* Header */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              New to SecureWallet?{" "}
              <Link
                to="/register"
                className="font-semibold text-accent hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center "></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium dark:text-slate-300"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="h-12 border-slate-200 bg-white pl-10 focus:ring-accent dark:bg-slate-900 dark:border-slate-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium dark:text-slate-300"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 border-slate-200 bg-white pl-10 pr-11 focus:ring-accent dark:bg-slate-900 dark:border-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              className="h-12 w-full text-base font-bold shadow-lg shadow-accent/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Verifying account...
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Dashboard <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 p-3">
            <Shield className="h-4 w-4 text-emerald-500" />
            <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
              Protected by AES-256 bank-grade encryption
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
