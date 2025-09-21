import { Card } from "@/components/ui/card";

interface ServiceItem {
  icon: string;
  label: string;
  href?: string;
}

const services: ServiceItem[] = [
  { icon: "💰", label: "Add Money" },
  { icon: "📄", label: "Recent Transactions" },
  { icon: "⏰", label: "Airtime to cash" },
  { icon: "📱", label: "Airtime" },
  { icon: "📶", label: "Data" },
  { icon: "💡", label: "Electricity" },
  { icon: "📊", label: "Betting" },
  { icon: "📺", label: "TV" },
  { icon: "➕", label: "More" }
];

const ServiceCard = ({ icon, label }: ServiceItem) => (
  <Card className="p-4 card-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer bg-card">
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-card-foreground leading-tight">
        {label}
      </span>
    </div>
  </Card>
);

export const ServiceGrid = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {services.map((service, index) => (
        <ServiceCard key={index} {...service} />
      ))}
    </div>
  );
};