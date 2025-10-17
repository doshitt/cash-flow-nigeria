import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
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
import AdminFeatures from "./pages/admin/Features";
import AdminKYCVerifications from "./pages/admin/KYCVerifications";
import KYCVerification from "./pages/KYCVerification";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected User App Routes */}
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
          <Route path="/airtime" element={<ProtectedRoute><Airtime /></ProtectedRoute>} />
          <Route path="/vouchers" element={<ProtectedRoute><Vouchers /></ProtectedRoute>} />
          <Route path="/refer-and-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
          <Route path="/recent-transactions" element={<ProtectedRoute><RecentTransactions /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
          <Route path="/transaction-limits" element={<ProtectedRoute><TransactionLimits /></ProtectedRoute>} />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/account-pin" element={<ProtectedRoute><AccountPin /></ProtectedRoute>} />
          <Route path="/cards-and-banks" element={<ProtectedRoute><CardsAndBanks /></ProtectedRoute>} />
          <Route path="/profile/kyc-verification" element={<ProtectedRoute><KYCVerification /></ProtectedRoute>} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/doshitt" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AdminLayout />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          }>
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
            <Route path="features" element={<AdminFeatures />} />
            <Route path="kyc-verifications" element={<AdminKYCVerifications />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
