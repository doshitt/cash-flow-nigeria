import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

const TransactionLimits = () => {
  const navigate = useNavigate();

  const limits = [
    {
      level: "Level 1",
      daily: "50,000",
      maximum: "300,000",
      bgColor: "bg-primary"
    },
    {
      level: "Level 2", 
      daily: "300,000",
      maximum: "1,000,000",
      bgColor: "bg-primary"
    },
    {
      level: "Level 3",
      daily: "5,000,000", 
      maximum: "Unlimited",
      bgColor: "bg-primary"
    },
    {
      level: "Level 4 (Vip)",
      daily: "Unlimited",
      maximum: "Unlimited", 
      bgColor: "bg-primary"
    }
  ];

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

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-6">
        <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">Transaction Limit</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 space-y-4">
        {limits.map((limit, index) => (
          <div 
            key={index}
            className={`${limit.bgColor} text-white rounded-xl p-6 text-center space-y-2`}
          >
            <h3 className="text-xl font-semibold">{limit.level}</h3>
            <p className="text-sm">Daily limit - {limit.daily}</p>
            <p className="text-sm">Maximum limit - {limit.maximum}</p>
          </div>
        ))}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default TransactionLimits;