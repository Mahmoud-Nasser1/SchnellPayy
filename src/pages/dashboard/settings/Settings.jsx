import { useState } from "react";
import { User, Shield, Key, Smartphone, Activity, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, fadeDown, stagger } from "@/lib/motion";
import { useToast } from "@/hooks/use-toast";

import SettingsProfile from "./components/SettingsProfile";
import Settings2FA from "./components/Settings2FA";
import SettingsActivityLog from "./components/SettingsActivityLog";
import SettingsKYC from "./components/SettingsKYC";

const tabs = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "2fa", icon: Smartphone, label: "2FA" },
  { id: "activity", icon: Activity, label: "Activity Log" },
  { id: "kyc", icon: FileCheck, label: "KYC Status" },
];

const activityLog = [
  {
    id: 1,
    action: "Login",
    device: "Chrome on MacOS",
    location: "San Francisco, CA",
    time: "2 min ago",
    risk: "low",
  },
  {
    id: 2,
    action: "Password Changed",
    device: "Safari on iPhone",
    location: "New York, NY",
    time: "2 days ago",
    risk: "medium",
  },
  {
    id: 3,
    action: "Login",
    device: "Firefox on Windows",
    location: "London, UK",
    time: "5 days ago",
    risk: "high",
  },
  {
    id: 4,
    action: "2FA Enabled",
    device: "Chrome on MacOS",
    location: "San Francisco, CA",
    time: "1 week ago",
    risk: "low",
  },
];

function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaved(true);
    toast({ title: "Profile saved", description: "Your changes have been saved successfully." });
    setTimeout(() => setSaved(false), 2e3);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeDown} custom={0}>
        <h1 className="font-display text-2xl font-bold text-foreground">Profile & Security</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings and security preferences
        </p>
      </motion.div>
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar Tabs */}
        <motion.div variants={fadeUp} custom={1} className="shrink-0 space-y-1 lg:w-56">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                activeTab === id
                  ? "border border-accent/20 bg-accent/10 text-accent"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </motion.div>
        {/* Content */}
        <motion.div variants={fadeUp} custom={2} className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[400px] rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              {activeTab === "profile" && (
                <SettingsProfile
                  emailNotif={emailNotif}
                  setEmailNotif={setEmailNotif}
                  smsNotif={smsNotif}
                  setSmsNotif={setSmsNotif}
                  saved={saved}
                  handleSave={handleSave}
                />
              )}

              {activeTab === "2fa" && (
                <Settings2FA />
              )}

              {activeTab === "activity" && (
                <SettingsActivityLog activityLog={activityLog} />
              )}

              {activeTab === "kyc" && (
                <SettingsKYC />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
export { SettingsPage as default };
