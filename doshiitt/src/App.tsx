import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminLayout } from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Customers from "@/pages/Customers";
import Disputes from "@/pages/Disputes";
import Refunds from "@/pages/Refunds";
import PaymentRequests from "@/pages/PaymentRequests";
import Coupons from "@/pages/Coupons";
import ExchangeRate from "@/pages/ExchangeRate";
import Referrals from "@/pages/Referrals";
import Cards from "@/pages/Cards";
import Notifications from "@/pages/Notifications";
import BannerAds from "@/pages/BannerAds";
import Team from "@/pages/Team";
import CoralPayTransactions from "@/pages/CoralPayTransactions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <Routes>
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="customers" element={<Customers />} />
                <Route path="disputes" element={<Disputes />} />
                <Route path="refunds" element={<Refunds />} />
                <Route path="payment-requests" element={<PaymentRequests />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="exchange-rate" element={<ExchangeRate />} />
                <Route path="referrals" element={<Referrals />} />
                <Route path="cards" element={<Cards />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="banner-ads" element={<BannerAds />} />
                <Route path="team" element={<Team />} />
                <Route path="coralpay-transactions" element={<CoralPayTransactions />} />
              </Route>
            </Routes>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;