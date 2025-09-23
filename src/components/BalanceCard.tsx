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

const currencies = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", balance: 75000000 },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", balance: 50000 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", balance: 35000 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", balance: 42000 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", balance: 125000 }
];

interface BalanceCardProps {
  balance?: number;
  currency?: string;
}

export const BalanceCard = ({ balance, currency = "₦" }: BalanceCardProps) => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
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
                <span className="text-xs">{selectedCurrency.flag}</span>
                <span className="text-xs">{selectedCurrency.code}</span>
                <ChevronDown size={12} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              {currencies.map((curr) => (
                <DropdownMenuItem
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="text-lg">{curr.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{curr.name}</div>
                    <div className="text-xs text-gray-500">{curr.symbol}{curr.balance.toLocaleString()}</div>
                  </div>
                  <span className="text-xs text-gray-400">{curr.code}</span>
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
        <span className="currency-symbol text-2xl">{selectedCurrency.symbol}</span>
        <span className="text-3xl font-bold">
          {showBalance ? selectedCurrency.balance.toLocaleString('en-NG', { minimumFractionDigits: 1 }) : "••••••"}
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
        selectedCurrency={selectedCurrency.code}
      />
    </Card>
  );
};