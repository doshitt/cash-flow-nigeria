import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
  currency?: string;
}

export const BalanceCard = ({ balance, currency = "₦" }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <Card className="gradient-primary text-primary-foreground p-6 card-shadow border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-90">Total Balance</span>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-white/20 px-2 py-1 rounded-md">
            {currency}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="text-white hover:bg-white/20 p-1 h-auto"
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <span className="currency-symbol text-2xl">₦</span>
        <span className="text-3xl font-bold">
          {showBalance ? balance.toLocaleString('en-NG', { minimumFractionDigits: 1 }) : "••••••"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
        >
          <span className="mr-2">💳</span>
          Withdraw
        </Button>
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
        >
          <span className="mr-2">🔄</span>
          Transfer
        </Button>
      </div>
    </Card>
  );
};