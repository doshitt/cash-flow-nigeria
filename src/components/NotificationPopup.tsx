import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Bell, CheckCircle, AlertCircle, Gift, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface Notification {
  id: string;
  type: "inflow" | "outflow" | "voucher_redeemed" | "system" | "success";
  title: string;
  message: string;
  amount?: number;
  currency?: string;
  timestamp: string;
  read: boolean;
  icon: React.ReactNode;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "inflow",
    title: "Money Received",
    message: "You received ₦50,000 from John Smith",
    amount: 50000,
    currency: "NGN",
    timestamp: "2024-01-15T10:30:00Z",
    read: false,
    icon: <ArrowDownLeft className="text-green-600" size={16} />
  },
  {
    id: "2",
    type: "voucher_redeemed",
    title: "Voucher Redeemed",
    message: "Sarah Johnson redeemed your ₦5,000 gift voucher",
    amount: 5000,
    currency: "NGN",
    timestamp: "2024-01-14T15:45:00Z",
    read: false,
    icon: <Gift className="text-purple-600" size={16} />
  },
  {
    id: "3",
    type: "success",
    title: "Transfer Successful",
    message: "Your transfer of ₦10,000 to Mike Davies was successful",
    amount: 10000,
    currency: "NGN",
    timestamp: "2024-01-14T14:20:00Z",
    read: true,
    icon: <CheckCircle className="text-green-600" size={16} />
  },
  {
    id: "4",
    type: "system",
    title: "New Feature Available",
    message: "Currency conversion is now available in your TesaPay app",
    timestamp: "2024-01-13T09:00:00Z",
    read: true,
    icon: <AlertCircle className="text-blue-600" size={16} />
  },
  {
    id: "5",
    type: "success",
    title: "Airtime Purchase",
    message: "₦1,000 airtime purchase completed successfully",
    amount: 1000,
    currency: "NGN",
    timestamp: "2024-01-12T16:30:00Z",
    read: true,
    icon: <CheckCircle className="text-green-600" size={16} />
  }
];

interface NotificationPopupProps {
  children: React.ReactNode;
}

export const NotificationPopup = ({ children }: NotificationPopupProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

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

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
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
            {notifications.length === 0 ? (
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
                    onClick={() => markAsRead(notification.id)}
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