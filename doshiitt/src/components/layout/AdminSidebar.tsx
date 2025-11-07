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
  ArrowLeftRight
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
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Transactions", url: "/transactions", icon: ArrowLeftRight },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Disputes", url: "/disputes", icon: MessageSquare },
  { title: "Refunds", url: "/refunds", icon: RefreshCw },
  { title: "Payment Requests", url: "/payment-requests", icon: FileText },
  { title: "Coupons", url: "/coupons", icon: Gift },
  { title: "Exchange Rate", url: "/exchange-rate", icon: TrendingUp },
  { title: "Referrals", url: "/referrals", icon: BarChart3 },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Banner Ads", url: "/banner-ads", icon: Image },
  { title: "CoralPay Transactions", url: "/coralpay-transactions", icon: BarChart3 },
  { title: "Team", url: "/team", icon: UserCog },
];

export function AdminSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
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
            {!collapsed && (
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
                      {!collapsed && <span>{item.title}</span>}
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