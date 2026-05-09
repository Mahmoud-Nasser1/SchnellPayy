import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Shield, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

function ResetPasswordPage() {
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      toast.error("Please restart the password reset process.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, newPassword });
      toast.success(res.data.message || "Password reset successfully!");
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold text-xl"
          >
            <div className="gradient-accent flex h-8 w-8 items-center justify-center rounded-lg shadow-glow">
              <Shield className="h-4 w-4 text-accent-foreground" />
            </div>
            Schnell<span className="text-accent">Pay</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          {!done ? (
            <form onSubmit={handleReset}>
              <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

              <div>
                <Label>New Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type={show ? "text" : "password"} 
                    className="pl-10" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                className="w-full mt-6 shadow-glow"
                variant="accent"
                type="submit"
                disabled={loading || !newPassword}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/30 border-t-accent-foreground" />
                    Updating...
                  </div>
                ) : (
                  <>
                    Update Password <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <Check className="text-green-500 h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold">Password Updated</h2>
              <p className="mt-2 text-sm text-muted-foreground mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>

              <Link to="/login">
                <Button className="w-full shadow-glow" variant="accent">
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
