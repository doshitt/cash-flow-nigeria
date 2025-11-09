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
import { useState, useEffect } from "react";
import { AddMoneyModal } from "@/components/AddMoneyModal";
import { useAuth } from "@/hooks/useAuth";
import { ConversionScreen } from "@/components/ConversionScreen";
import { getApiUrl, API_CONFIG } from "@/config/api";

const currencyInfo = {
  USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  NGN: { name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬" },
  GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧" },
  EUR: { name: "Euro", symbol: "€", flag: "🇪🇺" },
  GHS: { name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭" }
};

// Replace dummy transactions with live fetched data


const Wallet = () => {
  const { user, wallets } = useAuth();
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showConversion, setShowConversion] = useState(false);

  const formatBalance = (amount: number) => {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  };

  const selectedWallet = wallets?.find(w => w.currency === selectedCurrency);
  const currentInfo = currencyInfo[selectedCurrency as keyof typeof currencyInfo];

  useEffect(() => {
    const loadTx = async () => {
      try {
        const res = await fetch(getApiUrl('/transactions.php') + `?currency=${selectedCurrency}&limit=5`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('tesapay_session_token') || ''}` }
        });
        const data = await res.json();
        if (data.success) setTransactions(data.data);
      } catch {}
    };
    loadTx();
  }, [selectedCurrency]);

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
                <span className="text-sm">{selectedCurrency}</span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
              {wallets?.map((wallet) => (
                <DropdownMenuItem
                  key={wallet.id}
                  onClick={() => setSelectedCurrency(wallet.currency)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{wallet.currency}</div>
                    <div className="text-xs text-gray-500">{Number(wallet.balance).toLocaleString()}</div>
                  </div>
                  <span className="text-xs text-gray-400">{wallet.wallet_type}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Balance Display */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold mb-2">
            {formatBalance(Number(wallets?.find(w => w.currency === selectedCurrency)?.balance || 0))}
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
            onClick={() => setShowConversion(true)}
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
          {transactions.map((tx) => (
            <Card key={tx.transaction_id} className="p-4 border-0 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <div className="text-xs font-bold">
                    {tx.transaction_type?.slice(0, 1).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{tx.description || tx.transaction_type}</div>
                  <div className="text-muted-foreground text-xs">{new Date(tx.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{tx.currency} {Number(tx.amount).toLocaleString()}</div>
                </div>
              </div>
            </Card>
          ))}
          {transactions.length === 0 && (
            <Card className="p-4 border-0 bg-muted/30">
              <div className="text-sm text-muted-foreground">No transactions yet</div>
            </Card>
          )}
        </div>
      </div>

      <AddMoneyModal 
        open={showAddMoney} 
        onOpenChange={setShowAddMoney}
        selectedCurrency={selectedCurrency}
      />

      <BottomNavigation />
    </div>
  );
};

export default Wallet;