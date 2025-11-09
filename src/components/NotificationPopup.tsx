import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle, AlertCircle, Gift, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { getApiUrl } from "@/config/api";
interface Notification {
  id: string;
  type: "inflow" | "outflow" | "voucher_redeemed" | "system" | "success";
  title: string;
  message: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  read: boolean;
  icon?: React.ReactNode;
  link?: string;
}

interface NotificationPopupProps {
  children: React.ReactNode;
}

export const NotificationPopup = ({ children }: NotificationPopupProps) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('tesapay_session_token') || '';
      const res = await fetch(getApiUrl('/notifications.php'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const mapped = data.data.map((n: any) => ({
          ...n,
          icon: getIcon(n.type)
        }));
        setNotifications(mapped);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'inflow': return <ArrowDownLeft className="text-green-600" size={16} />;
      case 'outflow': return <ArrowUpRight className="text-red-600" size={16} />;
      case 'voucher_redeemed': return <Gift className="text-purple-600" size={16} />;
      case 'success': return <CheckCircle className="text-green-600" size={16} />;
      case 'system': return <AlertCircle className="text-blue-600" size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      NGN: "₦",
      USD: "$",
      GBP: "£",
      EUR: "€",
      GHS: "₵"
    };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, read: true }
          : n
      )
    );
    
    // Navigate to link if available
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "inflow":
        return "border-l-green-500";
      case "outflow":
        return "border-l-red-500";
      case "voucher_redeemed":
        return "border-l-purple-500";
      case "system":
        return "border-l-blue-500";
      case "success":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></div>
          )}
        </div>
      </SheetTrigger>
      <SheetContent side="left" className="w-[90%] max-w-sm p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Bell size={20} />
              <h2 className="text-lg font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="h-16 bg-muted rounded"></div>
                  </Card>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Bell size={48} className="text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                      !notification.read ? 'bg-muted/30' : ''
                    } cursor-pointer hover:bg-muted/50 transition-colors`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {notification.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        {notification.amount && notification.currency && (
                          <p className="text-sm font-medium mt-2">
                            {formatAmount(notification.amount, notification.currency)}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};