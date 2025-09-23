import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Savings from "./pages/Savings";
import Airtime from "./pages/Airtime";
import { Vouchers } from "./pages/Vouchers";
import ReferAndEarn from "./pages/ReferAndEarn";
import RecentTransactions from "./pages/RecentTransactions";
import Transfer from "./pages/Transfer";
import TransactionLimits from "./pages/TransactionLimits";
import ChangePassword from "./pages/ChangePassword";
import Notifications from "./pages/Notifications";
import AccountPin from "./pages/AccountPin";
import CardsAndBanks from "./pages/CardsAndBanks";
import NotFound from "./pages/NotFound";
// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import AdminTransactions from "./pages/admin/Transactions";
import AdminCustomers from "./pages/admin/Customers";
import AdminDisputes from "./pages/admin/Disputes";
import AdminRefunds from "./pages/admin/Refunds";
import AdminPaymentRequests from "./pages/admin/PaymentRequests";
import AdminCoupons from "./pages/admin/Coupons";
import AdminExchangeRate from "./pages/admin/ExchangeRate";
import AdminReferrals from "./pages/admin/Referrals";
import AdminCards from "./pages/admin/Cards";
import AdminNotifications from "./pages/admin/Notifications";
import AdminBannerAds from "./pages/admin/BannerAds";
import AdminTeam from "./pages/admin/Team";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* User App Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/airtime" element={<Airtime />} />
          <Route path="/vouchers" element={<Vouchers />} />
          <Route path="/refer-and-earn" element={<ReferAndEarn />} />
          <Route path="/recent-transactions" element={<RecentTransactions />} />
          <Route path="/transfer" element={<Transfer />} />
          <Route path="/transaction-limits" element={<TransactionLimits />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/account-pin" element={<AccountPin />} />
          <Route path="/cards-and-banks" element={<CardsAndBanks />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin/*" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <Routes>
                  <Route path="/" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="transactions" element={<AdminTransactions />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="disputes" element={<AdminDisputes />} />
                    <Route path="refunds" element={<AdminRefunds />} />
                    <Route path="payment-requests" element={<AdminPaymentRequests />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="exchange-rate" element={<AdminExchangeRate />} />
                    <Route path="referrals" element={<AdminReferrals />} />
                    <Route path="cards" element={<AdminCards />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                    <Route path="banner-ads" element={<AdminBannerAds />} />
                    <Route path="team" element={<AdminTeam />} />
                  </Route>
                </Routes>
              </div>
            </SidebarProvider>
          } />
          
          {/* Catch-all route - MUST be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
