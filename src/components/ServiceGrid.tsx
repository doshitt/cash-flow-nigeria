import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useFeatures } from "@/hooks/useFeatures";

interface ServiceItem {
  icon: string;
  label: string;
  featureId?: string;
  href?: string;
  onClick?: () => void;
}

const services: ServiceItem[] = [
  { icon: "💰", label: "Add Money", featureId: "add_via_bank" },
  { icon: "📄", label: "Recent Transactions" },
  { icon: "🎁", label: "Gift Vouchers", featureId: "voucher" },
  { icon: "📱", label: "Airtime", featureId: "airtime" },
  { icon: "📶", label: "Data", featureId: "data" },
  { icon: "💡", label: "Electricity" },
  { icon: "📊", label: "Betting" },
  { icon: "📺", label: "TV" }
];

const ServiceCard = ({ icon, label, onClick }: ServiceItem) => (
  <Card 
    className="p-4 card-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer bg-card"
    onClick={onClick}
  >
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-card-foreground leading-tight">
        {label}
      </span>
    </div>
  </Card>
);

export const ServiceGrid = () => {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatures();

  const handleServiceClick = (service: ServiceItem) => {
    if (service.label === "Airtime") {
      navigate("/airtime");
    } else if (service.label === "Recent Transactions") {
      navigate("/recent-transactions");
    }
    // Add more service navigation here as needed
  };

  // Filter services based on feature toggles
  const visibleServices = services.filter(service => {
    if (!service.featureId) return true; // Always show if no feature ID
    return isFeatureEnabled(service.featureId);
  });

  return (
    <div className="grid grid-cols-3 gap-3">
      {visibleServices.map((service, index) => (
        <ServiceCard 
          key={index} 
          {...service} 
          onClick={() => handleServiceClick(service)}
        />
      ))}
    </div>
  );
};