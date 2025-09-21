import { Card } from "@/components/ui/card";

const resellingServices = [
  { icon: "📊", label: "Data" },
  { icon: "⏰", label: "Airtime" }
];

export const ResellingSection = () => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Reselling</h3>
      <div className="grid grid-cols-2 gap-3">
        {resellingServices.map((service, index) => (
          <Card key={index} className="p-4 card-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-2xl">{service.icon}</span>
              <span className="text-sm font-medium">{service.label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};