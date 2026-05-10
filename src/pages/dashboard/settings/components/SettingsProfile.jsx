import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import useAuthStore from "../../../../store/authStore";
import api from "@/lib/api";

export default function SettingsProfile({ saved, handleSave }) {
  const isCapitalized = (str) => {
    if (!str) return false;
    return str.charAt(0) === str.charAt(0).toUpperCase();
  };
  const { user, updateAuthUser } = useAuthStore();
  const userData = user?.data || user || {};
  // console.log(userData);

  const [formData, setFormData] = useState({
    f_name: "",
    l_name: "",
    phone: "",
    country: "",
  });

  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        f_name: userData.f_name || "",
        l_name: userData.l_name || "",
        phone: userData.phone || "",
        country: userData.country || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async () => {
    const updatedFields = {};

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== userData[key]) {
        updatedFields[key] = formData[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes to save");
      return;
    }

    if (updatedFields.phone) {
      const phoneRegex = /^[0-9]{11}$/;

      if (!phoneRegex.test(updatedFields.phone)) {
        toast.error("Phone number must be exactly 11 digits.");
        return;
      }
    }
    if (!isCapitalized(formData.f_name)) {
      toast.error("First name must start with a capital letter");
      return;
    }

    if (!isCapitalized(formData.l_name)) {
      toast.error("Last name must start with a capital letter");
      return;
    }
    setIsUpdating(true);
    try {
      const response = await api.patch(`/users/updateMe`, updatedFields);

      updateAuthUser({
        ...user,
        data: { ...userData, ...updatedFields },
      });

      toast.success("Profile updated successfully");
      handleSave();
    } catch (error) {
      const msg = error.response?.data?.message || "Error updating profile";
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="gradient-card flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-primary-foreground shadow-navy">
          {userData.f_name?.[0]}
          {userData.l_name?.[0]}
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">
            {userData.f_name} {userData.l_name}
          </h3>
          <p className="text-sm text-muted-foreground">{userData.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "First Name", id: "f_name" },
          { label: "Last Name", id: "l_name" },
          { label: "Phone", id: "phone" },
          { label: "Country", id: "country" },
        ].map(({ label, id }) => (
          <div key={id}>
            <Label className="text-xs font-medium text-foreground">
              {label}
            </Label>
            <Input
              name={id}
              className="mt-1.5"
              value={formData[id]}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>

      <Button
        variant="accent"
        className="shadow-glow min-w-[140px]"
        onClick={onSubmit}
        disabled={isUpdating}
      >
        {isUpdating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : saved ? (
          <>
            <Check className="mr-2 h-4 w-4" /> Saved!
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}
