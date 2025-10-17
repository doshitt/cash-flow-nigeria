import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  CreditCard,
  MessageSquare,
  RefreshCw,
  FileText,
  Gift,
  TrendingUp,
  Shield,
  Bell,
  Image,
  UserCog,
  Home,
  ArrowLeftRight,
  Zap,
  FileCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/doshitt", icon: Home },
  { title: "Transactions", url: "/doshitt/transactions", icon: ArrowLeftRight },
  { title: "Customers", url: "/doshitt/customers", icon: Users },
  { title: "Disputes", url: "/doshitt/disputes", icon: MessageSquare },
  { title: "Refunds", url: "/doshitt/refunds", icon: RefreshCw },
  { title: "Payment Requests", url: "/doshitt/payment-requests", icon: FileText },
  { title: "Coupons", url: "/doshitt/coupons", icon: Gift },
  { title: "Exchange Rate", url: "/doshitt/exchange-rate", icon: TrendingUp },
  { title: "Referrals", url: "/doshitt/referrals", icon: BarChart3 },
  { title: "Cards", url: "/doshitt/cards", icon: CreditCard },
  { title: "Notifications", url: "/doshitt/notifications", icon: Bell },
  { title: "Banner Ads", url: "/doshitt/banner-ads", icon: Image },
  { title: "Team", url: "/doshitt/team", icon: UserCog },
  { title: "Features", url: "/doshitt/features", icon: Zap },
  { title: "KYC Verifications", url: "/doshitt/kyc-verifications", icon: FileCheck },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/doshitt") return currentPath === "/doshitt";
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-admin-sidebar-accent text-admin-sidebar-foreground/80 hover:text-admin-sidebar-foreground";

  return (
    <Sidebar className="bg-admin-sidebar border-r-0">
      <SidebarContent>
        <div className="p-4 border-b border-admin-sidebar-accent">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            {open && (
              <div>
                <h1 className="text-xl font-bold text-admin-sidebar-foreground">DoshiTT</h1>
                <p className="text-xs text-admin-sidebar-foreground/60">Admin Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-admin-sidebar-foreground/60 px-4 py-2">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}