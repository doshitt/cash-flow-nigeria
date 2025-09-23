import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

const Notifications = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    loginAlertEmail: true,
    transactionAlertEmail: true,
    transactionAlertSms: true
  });

  const handleToggle = (setting: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(getApiUrl('/notification_settings.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Replace with actual user ID
          settings
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Notification settings saved successfully");
      } else {
        toast.error(result.message || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto relative">
      {/* Status bar simulation */}
      <div className="flex items-center justify-between px-4 py-2 text-sm font-medium">
        <span>9:27</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-muted-foreground rounded-full"></div>
          </div>
          <span className="ml-2">📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-6">
        <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">Notifications</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 space-y-6">
        {/* Login Alert */}
        <div className="bg-muted/30 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-lg">Login Alert</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium">Email</span>
            <Switch
              checked={settings.loginAlertEmail}
              onCheckedChange={() => handleToggle('loginAlertEmail')}
            />
          </div>
        </div>

        {/* Transaction Alert */}
        <div className="bg-muted/30 rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-lg">Transaction Alert</h3>
          <div className="flex items-center justify-between">
            <span className="font-medium">Email</span>
            <Switch
              checked={settings.transactionAlertEmail}
              onCheckedChange={() => handleToggle('transactionAlertEmail')}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Sms</span>
            <Switch
              checked={settings.transactionAlertSms}
              onCheckedChange={() => handleToggle('transactionAlertSms')}
            />
          </div>
        </div>

        <Button 
          className="w-full bg-primary text-white py-3 rounded-xl font-medium mt-8"
          onClick={handleSaveChanges}
        >
          Save changes
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Notifications;