import { useState, useEffect } from "react";
import { Smartphone, Key, Shield, Lock, Eye, EyeOff, Mail, Check, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function Settings2FA() {
  const { user, updateAuthUser } = useAuthStore();
  const userData = user?.data || user || {};
  const mfaEnabled = userData.mfa_enabled;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Setup State
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: Select, 2: Config, 3: Verify, 4: Success/Backup
  const [setupMethod, setSetupMethod] = useState(null); // 'email' | 'app'
  const [setupData, setSetupData] = useState(null); // QR code, secret, etc.
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);

  // Disable State
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

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

  const handleStartSetup = async (method) => {
    setSetupMethod(method);
    setLoading(true);
    try {
      const res = await api.post("/auth/2fa/setup", { method });
      setSetupData(res.data.data);
      setSetupStep(2); // Move to configuration/display step
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to initiate MFA setup");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (verificationCode.length < 6) return;
    setIsVerifying(true);
    try {
      const res = await api.post("/auth/2fa/verify-setup", { code: verificationCode });
      setBackupCodes(res.data.data.backup_codes);
      setSetupStep(4); // Success step
      
      // Update local user state
      updateAuthUser({
        ...user,
        data: { ...userData, mfa_enabled: true, mfa_method: setupMethod }
      });
      
      toast.success("MFA enabled successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid verification code");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisableMfa = async () => {
    if (disableCode.length < 6) return;
    setIsDisabling(true);
    try {
      await api.post("/auth/2fa/disable", { code: disableCode });
      
      // Update local user state
      updateAuthUser({
        ...user,
        data: { ...userData, mfa_enabled: false, mfa_method: null }
      });
      
      toast.success("MFA disabled successfully");
      setIsDisableOpen(false);
      setDisableCode("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to disable MFA");
    } finally {
      setIsDisabling(false);
    }
  };

  // Manage Backup Codes State
  const [isManageBackupOpen, setIsManageBackupOpen] = useState(false);
  const [manageCode, setManageCode] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showNewBackupCodes, setShowNewBackupCodes] = useState(false);

  const handleRegenerateBackupCodes = async () => {
    if (manageCode.length < 6) return;
    setIsRegenerating(true);
    try {
      const res = await api.post("/auth/2fa/regenerate-backup-codes", {
        code: manageCode,
      });
      setBackupCodes(res.data.data.backup_codes);
      setShowNewBackupCodes(true);
      setManageCode("");
      toast.success("Backup codes regenerated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to regenerate codes");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSendMfaOtp = async (silent = false) => {
    try {
      await api.post("/auth/2fa/send-otp", {
        username: userData.user_name || userData.email,
      });
      if (!silent)
        toast.success("A verification code has been sent to your email.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send verification code",
      );
    }
  };

  const onToggleMfa = (checked) => {
    if (checked) {
      setIsSetupOpen(true);
    } else {
      if (userData.mfa_method === "email") {
        handleSendMfaOtp();
      }
      setIsDisableOpen(true);
    }
  };

  const onManageBackupCodes = () => {
    if (userData.mfa_method === "email") {
      handleSendMfaOtp();
    }
    setIsManageBackupOpen(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const resetSetup = () => {
    setIsSetupOpen(false);
    setSetupStep(1);
    setSetupMethod(null);
    setSetupData(null);
    setVerificationCode("");
    setBackupCodes([]);
  };

  const resetManageBackup = () => {
    setIsManageBackupOpen(false);
    setManageCode("");
    setShowNewBackupCodes(false);
    setBackupCodes([]);
  };

  return (
    <div className="space-y-5">
      {/* 2FA Status Card */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              mfaEnabled ? "gradient-accent" : "bg-muted",
            )}
          >
            <Smartphone
              className={cn(
                "h-5 w-5",
                mfaEnabled
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
              {mfaEnabled
                ? `Enabled — Your account is protected via ${userData.mfa_method === "app" ? "Authenticator App" : "Email"}`
                : "Disabled — Enable for better security"}
            </p>
          </div>
        </div>
        <Switch checked={mfaEnabled} onCheckedChange={onToggleMfa} />
      </div>

      {/* Settings Sections */}
      {mfaEnabled && (
        <div className="animate-fade-in space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-accent/40 bg-accent/5 p-4 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent">
              {userData.mfa_method === "app" ? (
                <Smartphone className="h-4 w-4 text-accent-foreground" />
              ) : (
                <Mail className="h-4 w-4 text-accent-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                {userData.mfa_method === "app"
                  ? "Authenticator App"
                  : "Email Verification"}
              </p>
              <p className="text-xs text-muted-foreground">
                {userData.mfa_method === "app"
                  ? "Using TOTP (Time-based One-Time Password)"
                  : userData.email}
              </p>
            </div>
            <span className="secure-badge text-xs">Active</span>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border p-4 hover:border-accent/30 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Backup Codes
              </p>
              <p className="text-xs text-muted-foreground">
                Use these codes if you lose access to your device
              </p>
            </div>
            <button
              onClick={onManageBackupCodes}
              className="text-xs text-accent hover:underline"
            >
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Change Password Section */}
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

      {/* 2FA SETUP DIALOG */}
      <Dialog open={isSetupOpen} onOpenChange={(val) => !val && resetSetup()}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Setup Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Add an extra layer of security to your account.
            </DialogDescription>
          </DialogHeader>

          {/* STEP 1: SELECT METHOD */}
          {setupStep === 1 && (
            <div className="space-y-4 py-4">
              <button
                onClick={() => handleStartSetup('app')}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Smartphone className="h-6 w-6 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Authenticator App</p>
                  <p className="text-xs text-muted-foreground">Use Google Authenticator, Authy, etc.</p>
                </div>
              </button>
              
              <button
                onClick={() => handleStartSetup('email')}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Email Code</p>
                  <p className="text-xs text-muted-foreground">Receive a secure code via email</p>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: CONFIGURE (APP QR) */}
          {setupStep === 2 && setupMethod === 'app' && (
            <div className="space-y-6 py-4 flex flex-col items-center">
              <div className="p-3 bg-white rounded-xl shadow-lg border border-border">
                <img src={setupData.qr_code} alt="QR Code" className="h-44 w-44" />
              </div>
              <div className="w-full space-y-2">
                <p className="text-sm font-medium text-center">Scan the QR code or enter this secret manually:</p>
                <div className="flex items-center gap-2 bg-muted p-2 rounded-lg border border-border">
                  <code className="flex-1 text-center font-mono text-xs">{setupData.secret}</code>
                  <button onClick={() => copyToClipboard(setupData.secret)} className="p-1 hover:text-accent">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <Button className="w-full" variant="accent" onClick={() => setSetupStep(3)}>
                Next: Verify Code
              </Button>
            </div>
          )}

          {/* STEP 2: CONFIGURE (EMAIL SEND) */}
          {setupStep === 2 && setupMethod === 'email' && (
            <div className="space-y-6 py-6 text-center">
              <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-accent animate-bounce" />
              </div>
              <div className="space-y-2">
                <p className="font-bold">Verification code sent!</p>
                <p className="text-sm text-muted-foreground px-4">
                  We've sent a 6-digit code to <span className="text-foreground font-medium">{userData.email}</span>
                </p>
              </div>
              <Button className="w-full" variant="accent" onClick={() => setSetupStep(3)}>
                I have the code
              </Button>
            </div>
          )}

          {/* STEP 3: VERIFY */}
          {setupStep === 3 && (
            <div className="space-y-6 py-4 flex flex-col items-center">
              <p className="text-sm font-medium text-center">
                Enter the 6-digit code from your {setupMethod === 'app' ? 'authenticator app' : 'email'}
              </p>
              <InputOTP 
                maxLength={6} 
                value={verificationCode} 
                onChange={setVerificationCode}
                onComplete={handleVerifySetup}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button 
                className="w-full" 
                variant="accent" 
                onClick={handleVerifySetup}
                disabled={isVerifying || verificationCode.length < 6}
              >
                {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify & Enable"}
              </Button>
              <button onClick={() => setSetupStep(2)} className="text-xs text-muted-foreground hover:text-foreground">
                Go back
              </button>
            </div>
          )}

          {/* STEP 4: SUCCESS / BACKUP CODES */}
          {setupStep === 4 && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-500" />
                </div>
                <p className="font-bold text-lg">MFA Setup Complete!</p>
                <p className="text-xs text-muted-foreground">
                  Store these backup codes safely. They are required if you lose access to your {setupMethod === 'app' ? 'device' : 'email'}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-muted p-4 rounded-xl border border-border font-mono text-xs">
                {backupCodes.map((code, idx) => (
                  <div key={idx} className="flex items-center gap-2 justify-between px-2 py-1 bg-background rounded-md">
                    <span>{idx + 1}. {code}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2" onClick={() => copyToClipboard(backupCodes.join('\n'))}>
                  <Copy className="h-4 w-4" /> Copy All
                </Button>
                <Button variant="accent" className="flex-1" onClick={resetSetup}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DISABLE MFA DIALOG */}
      <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Disable 2FA
            </DialogTitle>
            <DialogDescription>
              Are you sure? This will make your account less secure.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 flex flex-col items-center">
            <p className="text-sm font-medium text-center">
              Enter your current MFA code or a backup code to confirm.
            </p>
            <InputOTP maxLength={6} value={disableCode} onChange={setDisableCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setIsDisableOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1" 
                onClick={handleDisableMfa}
                disabled={isDisabling || disableCode.length < 6}
              >
                {isDisabling ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* MANAGE BACKUP CODES DIALOG */}
      <Dialog
        open={isManageBackupOpen}
        onOpenChange={(val) => !val && resetManageBackup()}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Manage Backup Codes
            </DialogTitle>
            <DialogDescription>
              {showNewBackupCodes
                ? "Here are your new backup codes. Store them safely!"
                : "Enter a 2FA code to regenerate your backup codes."}
            </DialogDescription>
          </DialogHeader>

          {!showNewBackupCodes ? (
            <div className="space-y-6 py-4 flex flex-col items-center">
              <p className="text-sm font-medium text-center text-muted-foreground">
                For security, you must verify your identity before regenerating
                codes.
              </p>
              <InputOTP
                maxLength={6}
                value={manageCode}
                onChange={setManageCode}
                onComplete={handleRegenerateBackupCodes}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <div className="flex gap-3 w-full pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={resetManageBackup}
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  className="flex-1 shadow-glow"
                  onClick={handleRegenerateBackupCodes}
                  disabled={isRegenerating || manageCode.length < 6}
                >
                  {isRegenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "Regenerate"
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-2 bg-muted p-4 rounded-xl border border-border font-mono text-xs">
                {backupCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 justify-between px-2 py-1 bg-background rounded-md"
                  >
                    <span>
                      {idx + 1}. {code}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => copyToClipboard(backupCodes.join("\n"))}
                >
                  <Copy className="h-4 w-4" /> Copy All
                </Button>
                <Button
                  variant="accent"
                  className="flex-1"
                  onClick={resetManageBackup}
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
