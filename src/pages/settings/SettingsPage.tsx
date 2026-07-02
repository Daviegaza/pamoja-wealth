import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/stores/settingsStore";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/api/axios";
import { toast } from "sonner";

export default function SettingsPage() {
  const settings = useSettingsStore();
  const { mode, setMode } = useTheme();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [changingPw, setChangingPw] = useState(false);

  async function handleChangePassword() {
    if (!user?.email) {
      navigate("/forgot-password");
      return;
    }
    setChangingPw(true);
    try {
      await api.post("/auth/forgot-password", { email: user.email });
      toast.success(`Password reset link sent to ${user.email}. Check your inbox.`);
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      if (msg) toast.error(msg);
      else navigate("/forgot-password");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <Tabs
        items={[
          {
            value: "general", label: "General",
            content: (
              <div className="card-base p-6 space-y-5">
                <Select
                  label="Theme"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as typeof mode)}
                  options={[{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }, { label: "System", value: "system" }]}
                />
                <Select
                  label="Language"
                  value={settings.language}
                  onChange={(e) => settings.update({ language: e.target.value })}
                  options={[{ label: "English", value: "en" }, { label: "Swahili", value: "sw" }, { label: "French", value: "fr" }]}
                />
                <Select
                  label="Currency"
                  value={settings.currency}
                  onChange={(e) => settings.update({ currency: e.target.value })}
                  options={[{ label: "KES — Kenyan Shilling", value: "KES" }, { label: "USD — US Dollar", value: "USD" }, { label: "UGX — Ugandan Shilling", value: "UGX" }]}
                />
              </div>
            ),
          },
          {
            value: "notifications", label: "Notifications",
            content: (
              <div className="card-base p-6 space-y-5">
                <Switch checked={settings.emailNotifications} onChange={(v) => settings.update({ emailNotifications: v })} label="Email notifications" />
                <Switch checked={settings.smsNotifications} onChange={(v) => settings.update({ smsNotifications: v })} label="SMS notifications" />
                <Switch checked={settings.pushNotifications} onChange={(v) => settings.update({ pushNotifications: v })} label="Push notifications" />
              </div>
            ),
          },
          {
            value: "security", label: "Security",
            content: (
              <div className="card-base p-6 space-y-5">
                <Switch checked={settings.twoFactorEnabled} onChange={(v) => settings.update({ twoFactorEnabled: v })} label="Two-factor authentication" />
                <Button variant="outline" onClick={handleChangePassword} disabled={changingPw}>
                  {changingPw ? "Sending…" : "Change password"}
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
