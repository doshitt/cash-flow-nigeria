import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Card } from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { AddMoneyModal } from "@/components/AddMoneyModal";

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", balance: 50000 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", balance: 75000000 },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", balance: 35000 },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", balance: 42000 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", balance: 125000 }
];

const transactions = [
  {
    id: 1,
    merchant: "Starbucks",
    category: "Coffee & restaurants",
    amount: "-1.33 USD",
    icon: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=40&h=40&fit=crop"
  },
  {
    id: 2,
    merchant: "Starbucks",
    category: "Coffee & restaurants", 
    amount: "-1.33 USD",
    icon: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=40&h=40&fit=crop"
  },
  {
    id: 3,
    merchant: "Starbucks",
    category: "Coffee & restaurants",
    amount: "-1.33 USD", 
    icon: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=40&h=40&fit=crop"
  },
  {
    id: 4,
    merchant: "Starbucks",
    category: "Coffee & restaurants",
    amount: "-1.33 USD",
    icon: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=40&h=40&fit=crop"
  }
];

const Wallet = () => {
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [showAddMoney, setShowAddMoney] = useState(false);

  const formatBalance = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 0 });
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto relative">
      {/* Status bar simulation */}
      <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-white">
        <span>9:27</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
          <span className="ml-2">📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header Section with Gradient */}
      <div className="gradient-primary text-white px-4 pb-8">
        {/* Search and Profile */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70" size={18} />
            <Input 
              placeholder="Search transaction" 
              className="pl-10 bg-white/20 border-0 rounded-full placeholder:text-white/70 text-white"
            />
          </div>
          
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>JJ</AvatarFallback>
          </Avatar>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center justify-center mb-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-white/90 hover:text-white hover:bg-white/10">
                <span className="text-sm">{selectedCurrency.flag}</span>
                <span className="text-sm font-medium">{selectedCurrency.name}</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              {currencies.map((currency) => (
                <DropdownMenuItem
                  key={currency.code}
                  onClick={() => setSelectedCurrency(currency)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <span className="text-lg">{currency.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{currency.name}</div>
                    <div className="text-xs text-gray-500">{currency.symbol}{currency.balance.toLocaleString()}</div>
                  </div>
                  <span className="text-xs text-gray-400">{currency.code}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance Display */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2">
            {selectedCurrency.symbol}{formatBalance(selectedCurrency.balance)}
          </div>
          <div className="text-white/80 text-sm">
            Available Balance
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-3">
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          >
            Convert
          </Button>
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
            onClick={() => setShowAddMoney(true)}
          >
            Add Money
          </Button>
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          >
            Send Money
          </Button>
          <Button 
            variant="secondary" 
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
          >
            More
          </Button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="px-4 pt-6">
        <h3 className="text-lg font-semibold mb-4">Transactions</h3>
        
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 border-0 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="font-medium text-sm">{transaction.merchant}</div>
                  <div className="text-muted-foreground text-xs">{transaction.category}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-sm">{transaction.amount}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <AddMoneyModal 
        open={showAddMoney} 
        onOpenChange={setShowAddMoney}
        selectedCurrency={selectedCurrency.code}
      />

      <BottomNavigation />
    </div>
  );
};

export default Wallet;