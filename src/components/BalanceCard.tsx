import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddMoneyModal } from "./AddMoneyModal";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";

interface BalanceCardProps {}


export const BalanceCard = () => {
  const { wallets } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const defaultCurr = wallets.find(w => w.currency === 'NGN')?.currency || wallets[0]?.currency || 'NGN';
  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurr);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const navigate = useNavigate();

  return (
    <Card className="gradient-primary text-primary-foreground p-6 card-shadow border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm opacity-90">Total Balance</span>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 text-white hover:bg-white/20 p-2 h-auto">
                <span className="text-xs">{selectedCurrency}</span>
                <ChevronDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              {wallets.map((w) => (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => setSelectedCurrency(w.currency)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{w.currency}</div>
                    <div className="text-xs text-gray-500">{w.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  </div>
                  <span className="text-xs text-gray-400">{w.wallet_type}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
        <span className="currency-symbol text-2xl">{selectedCurrency}</span>
        <span className="text-3xl font-bold">
          {showBalance ? (wallets.find(w => w.currency === selectedCurrency)?.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 }) : "••••••"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
          onClick={() => setShowAddMoney(true)}
        >
          <span className="mr-2">💰</span>
          Add Money
        </Button>
        <Button 
          variant="secondary" 
          className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
          onClick={() => navigate('/transfer')}
        >
          <span className="mr-2">🔄</span>
          Transfer
        </Button>
      </div>

      <AddMoneyModal 
        open={showAddMoney} 
        onOpenChange={setShowAddMoney}
        selectedCurrency={selectedCurrency}
      />
    </Card>
  );
};