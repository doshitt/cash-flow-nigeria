import { Card } from "@/components/ui/card";

const inAdsServices = [
  { icon: "🎫", label: "Create" },
  { icon: "🎁", label: "Redeem" },
  { icon: "💰", label: "Refer and Earn" }
];

const bottomServices = [
  { icon: "💱", label: "Ex Rate" },
  { icon: "🔮", label: "What's Next" },
  { icon: "🌐", label: "Language" }
];

export const InAdsSection = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">In Ads</h3>
        <div className="space-y-4">
          <h4 className="font-medium text-muted-foreground">Coupons</h4>
          <div className="grid grid-cols-3 gap-3">
            {inAdsServices.map((service, index) => (
              <Card key={index} className="p-4 card-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">{service.icon}</span>
                  <span className="text-xs font-medium leading-tight">{service.label}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {bottomServices.map((service, index) => (
          <Card key={index} className="p-4 card-shadow border-0 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-2xl">{service.icon}</span>
              <span className="text-xs font-medium leading-tight">{service.label}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};