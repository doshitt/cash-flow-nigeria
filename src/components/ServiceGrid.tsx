import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface ServiceItem {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
}

const services: ServiceItem[] = [
  { icon: "💰", label: "Add Money" },
  { icon: "📄", label: "Recent Transactions" },
  { icon: "🎁", label: "Gift Vouchers" },
  { icon: "📱", label: "Airtime" },
  { icon: "📶", label: "Data" },
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

  const handleServiceClick = (service: ServiceItem) => {
    if (service.label === "Airtime") {
      navigate("/airtime");
    } else if (service.label === "Gift Vouchers") {
      navigate("/vouchers");
    }
    // Add more service navigation here as needed
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {services.map((service, index) => (
        <ServiceCard 
          key={index} 
          {...service} 
          onClick={() => handleServiceClick(service)}
        />
      ))}
    </div>
  );
};