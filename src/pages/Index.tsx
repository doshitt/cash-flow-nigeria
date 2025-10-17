import { TopHeader } from "@/components/TopHeader";
import { BalanceCard } from "@/components/BalanceCard";
import { ServiceGrid } from "@/components/ServiceGrid";
import { ResellingSection } from "@/components/ResellingSection";
import { InAdsSection } from "@/components/InAdsSection";
import { BottomNavigation } from "@/components/BottomNavigation";
import { KYCAlertBanner } from "@/components/KYCAlertBanner";

const Index = () => {
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

      <TopHeader />
      
      <div className="px-4 space-y-6">
        <KYCAlertBanner />
        <BalanceCard />
        <ServiceGrid />
        <ResellingSection />
        <InAdsSection />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Index;
