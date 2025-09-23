import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
