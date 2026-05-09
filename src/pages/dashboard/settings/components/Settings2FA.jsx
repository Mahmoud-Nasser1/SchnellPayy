import { useState } from "react";
import { Smartphone, Key, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

export default function Settings2FA({
  twoFaEnabled,
  setTwoFaEnabled,
  showPwd,
  setShowPwd,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", { currentPassword, newPassword });
      toast.success(res.data?.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              twoFaEnabled ? "gradient-accent" : "bg-muted",
            )}
          >
            <Smartphone
              className={cn(
                "h-5 w-5",
                twoFaEnabled
                  ? "text-accent-foreground"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Two-Factor Authentication
            </p>
            <p className="text-xs text-muted-foreground">
              {twoFaEnabled
                ? "Enabled \u2013 Your account is protected"
                : "Disabled \u2013 Enable for better security"}
            </p>
          </div>
        </div>
        <Switch checked={twoFaEnabled} onCheckedChange={setTwoFaEnabled} />
      </div>
      {twoFaEnabled && (
        <div className="animate-fade-in space-y-3">
          {[
            {
              icon: Smartphone,
              title: "Authenticator App",
              desc: "Google Authenticator or Authy",
              active: true,
            },
            {
              icon: Key,
              title: "Email Verification",
              desc: "john@example.com",
              active: false,
            },
            {
              icon: Shield,
              title: "Backup Codes",
              desc: "10 single-use codes",
              active: false,
            },
          ].map(({ icon: Icon, title, desc, active }) => (
            <div
              key={title}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-4 transition-colors",
                active
                  ? "border-accent/40 bg-accent/5"
                  : "border-border hover:border-accent/30",
              )}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  active ? "gradient-accent" : "bg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-accent-foreground" : "text-muted-foreground",
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {active ? (
                <span className="secure-badge text-xs">Active</span>
              ) : (
                <button className="text-xs text-accent hover:underline">
                  Set up
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="space-y-3 border-t border-border pt-4">
        <h3 className="font-display font-semibold text-foreground">
          Change Password
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-foreground">
              Current Password
            </Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="pl-10" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-foreground">
              New Password
            </Label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPwd ? "text" : "password"}
                placeholder="Min. 8 characters"
                className="pl-10 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPwd ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" variant="accent" className="shadow-glow" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
