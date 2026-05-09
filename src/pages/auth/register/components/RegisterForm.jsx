import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  AtSign,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Moon,
  Phone,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fadeDown, fadeUp, stagger } from "@/lib/motion";
import CountrySelect from "./CountrySelect";
import { toast } from "sonner";
import api from "@/lib/api";

function RegisterForm({ theme, toggleTheme }) {
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
    transPin: "",
  });

  const navigate = useNavigate();

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  };

  const pwdStrength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const pwdColors = [
    "bg-destructive",
    "bg-destructive",
    "bg-warning",
    "bg-accent",
    "bg-accent",
  ];
  const pwdLabels = ["", "Weak", "Fair", "Good", "Strong"];

  const validate = () => {
    const e = {};
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(form.username))
      e.username = "3–20 chars: letters, numbers, underscore";
    if (!/^[0-9]{4,6}$/.test(form.transPin))
      e.transPin = "TransPIN must be 4–6 digits";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    if (!validate()) return;
    setLoading(true);
    
    try {
      const payload = {
        fname: form.firstName,
        lname: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        country: form.country,
        user_name: form.username,
        transaction_pin: form.transPin
      };
      
      const res = await api.post("/auth/register", payload);
      
      if (res.data.success) {
        toast.success("Registration successful! Please verify your email.");
        navigate("/otp-verify", { state: { email: form.email } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="relative flex flex-1 flex-col justify-center overflow-y-auto bg-background px-6 py-10"
    >
      <div className="absolute right-4 top-4">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-md"
      >
        <motion.div variants={fadeDown} custom={0}>
          <Link
            to="/"
            className="mb-8 flex items-center gap-2 font-display text-xl font-bold lg:hidden"
          >
            <div className="gradient-accent flex h-8 w-8 items-center justify-center rounded-lg shadow-glow">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            Secure<span className="text-accent">Wallet</span>
          </Link>
        </motion.div>

        <motion.div variants={fadeUp} custom={0}>
          <h1 className="mb-1 font-display text-3xl font-bold text-foreground">
            Create account
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-accent hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-muted-foreground">
              register with email
            </span>
          </div>
        </motion.div>

        <motion.form
          variants={stagger}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="grid grid-cols-2 gap-3"
          >
            <div>
              <Label
                htmlFor="firstName"
                className="text-xs font-medium text-foreground"
              >
                First name
              </Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="John"
                  className="h-11 pl-10"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label
                htmlFor="lastName"
                className="text-xs font-medium text-foreground"
              >
                Last name
              </Label>
              <div className="mt-1.5">
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-11"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  required
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <Label
              htmlFor="username"
              className="text-xs font-medium text-foreground"
            >
              Username
            </Label>
            <div className="relative mt-1.5">
              <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="username"
                placeholder="johndoe"
                className="h-11 pl-10"
                value={form.username}
                onChange={(e) =>
                  update("username", e.target.value.replace(/\s/g, ""))
                }
                maxLength={20}
                required
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-xs text-destructive">{errors.username}</p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <Label
              htmlFor="email"
              className="text-xs font-medium text-foreground"
            >
              Email address
            </Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 pl-10"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={2}>
            <Label
              htmlFor="phone"
              className="text-xs font-medium text-foreground"
            >
              Phone number
            </Label>
            <div className="relative mt-1.5">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="+1 (555) 000-0000"
                className="h-11 pl-10"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={3}>
            <Label className="text-xs font-medium text-foreground">
              Country
            </Label>
            <div className="mt-1.5">
              <CountrySelect
                value={form.country}
                onChange={(v) => update("country", v)}
              />
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={4}>
            <Label
              htmlFor="password"
              className="text-xs font-medium text-foreground"
            >
              Password
            </Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="h-11 pl-10 pr-10"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-all duration-300",
                        i <= pwdStrength ? pwdColors[pwdStrength] : "bg-muted",
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {pwdLabels[pwdStrength]} password
                </p>
              </div>
            )}
          </motion.div>

          <motion.div variants={fadeUp} custom={5}>
            <Label
              htmlFor="confirmPwd"
              className="text-xs font-medium text-foreground"
            >
              Confirm password
            </Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirmPwd"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                className="h-11 pl-10 pr-10"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                required
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {form.confirmPassword &&
                  (form.password === form.confirmPassword ? (
                    <Check className="h-4 w-4 text-accent" />
                  ) : (
                    <span className="text-xs font-bold text-destructive">
                      ✗
                    </span>
                  ))}
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </motion.div>

          <motion.div variants={fadeUp} custom={6}>
            <Label
              htmlFor="transPin"
              className="text-xs font-medium text-foreground"
            >
              Transaction PIN
              <span className="ml-1 font-normal text-muted-foreground">
                (6 digits)
              </span>
            </Label>
            <div className="relative mt-1.5">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="transPin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                placeholder="••••••"
                className="h-11 pl-10 pr-10 tracking-[0.4em]"
                maxLength={6}
                value={form.transPin}
                onChange={(e) =>
                  update(
                    "transPin",
                    e.target.value.replace(/\D/g, "").slice(0, 6),
                  )
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.transPin ? (
              <p className="mt-1 text-xs text-destructive">{errors.transPin}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Used to authorize sensitive transactions.
              </p>
            )}
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={7}
            className="flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/5 p-4"
          >
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(!!v)}
              className="mt-0.5"
            />
            <label
              htmlFor="terms"
              className="cursor-pointer text-sm leading-relaxed text-foreground/85"
            >
              I agree to the{" "}
              <Link
                to="/faq"
                className="font-medium text-accent hover:underline"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/faq"
                className="font-medium text-accent hover:underline"
              >
                Privacy Policy
              </Link>
            </label>
          </motion.div>

          <motion.div variants={fadeUp} custom={8}>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="h-12 w-full text-base shadow-glow"
              disabled={!agreed || loading || !form.country}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                  Creating account...
                </div>
              ) : (
                <>
                  Create Free Account <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={9}
          className="mt-6 flex items-center justify-center"
        >
          <div className="secure-badge">
            <Shield className="h-3 w-3" />
            Your data is encrypted and secure
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default RegisterForm;
