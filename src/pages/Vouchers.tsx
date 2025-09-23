import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Copy, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { VoucherSuccess } from "@/components/VoucherSuccess";
import { VoucherRedeem } from "@/components/VoucherRedeem";
import { VoucherRedeemSuccess } from "@/components/VoucherRedeemSuccess";
import { useToast } from "@/hooks/use-toast";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavigation } from "@/components/BottomNavigation";

interface Voucher {
  id: number;
  code: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  redeemed_by_name?: string;
  redeemed_at?: string;
}

const currencies = [
  { code: "NGN", symbol: "₦", balance: 50000, minimum: 1000 },
  { code: "USD", symbol: "$", balance: 1200, minimum: 1 },
  { code: "GBP", symbol: "£", balance: 800, minimum: 1 },
  { code: "EUR", symbol: "€", balance: 900, minimum: 1 },
  { code: "GHS", symbol: "₵", balance: 15000, minimum: 50 }
];

export const Vouchers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'create' | 'success' | 'redeem' | 'redeem-success'>('create');
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdVoucherCode, setCreatedVoucherCode] = useState<string>("");
  const [userVouchers, setUserVouchers] = useState<Voucher[]>([]);
  const [redeemCode, setRedeemCode] = useState<string>("");
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [redeemCurrency, setRedeemCurrency] = useState<string>("");

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency);

  // Fetch user vouchers
  const fetchUserVouchers = async () => {
    try {
      const response = await fetch('http://localhost:8080/backend/gift_vouchers.php?action=user_vouchers&user_id=1');
      const data = await response.json();
      if (data.success) {
        setUserVouchers(data.vouchers);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    }
  };

  // Load user vouchers on component mount
  useEffect(() => {
    fetchUserVouchers();
  }, []);

  const handleCreateVoucher = async () => {
    if (!selectedCurrency || !amount) {
      toast({
        title: "Error",
        description: "Please select currency and enter amount",
        variant: "destructive"
      });
      return;
    }

    const numericAmount = parseFloat(amount);
    const currencyBalance = selectedCurrencyData?.balance || 0;
    const minimumAmount = selectedCurrencyData?.minimum || 0;

    // Check minimum amount
    if (numericAmount < minimumAmount) {
      toast({
        title: "Minimum Amount Required",
        description: `Minimum voucher amount is ${selectedCurrencyData?.symbol}${minimumAmount.toLocaleString()} ${selectedCurrency}`,
        variant: "destructive"
      });
      return;
    }

    // Check sufficient balance
    if (numericAmount > currencyBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Your ${selectedCurrency} balance is insufficient`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/backend/gift_vouchers.php?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Mock user ID
          amount: numericAmount,
          currency: selectedCurrency
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCreatedVoucherCode(data.voucher_code);
        setCurrentStep('success');
        // Refresh voucher list after creation
        fetchUserVouchers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create voucher",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Voucher creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create voucher. Please check your connection and try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleRedeemVoucher = async () => {
    if (!redeemCode.trim()) {
      toast({
        title: "Error", 
        description: "Please enter voucher code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/backend/gift_vouchers.php?action=redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Mock user ID
          code: redeemCode.trim()
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setRedeemAmount(data.amount_received);
        setRedeemCurrency(data.currency);
        setCurrentStep('redeem-success');
      } else {
        toast({
          title: "Redemption Failed",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redeem voucher. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Voucher code copied to clipboard"
    });
  };

  if (currentStep === 'success') {
    return (
      <VoucherSuccess 
        voucherCode={createdVoucherCode}
        onDone={() => navigate('/')}
        onCreateNew={() => {
          setCurrentStep('create');
          setAmount("");
          setSelectedCurrency("");
        }}
      />
    );
  }

  if (currentStep === 'redeem') {
    return (
      <VoucherRedeem 
        onBack={() => setCurrentStep('create')}
        redeemCode={redeemCode}
        setRedeemCode={setRedeemCode}
        onRedeem={handleRedeemVoucher}
        isLoading={isLoading}
      />
    );
  }

  if (currentStep === 'redeem-success') {
    return (
      <VoucherRedeemSuccess 
        amount={redeemAmount}
        currency={redeemCurrency}
        onDone={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      
      <div className="pt-16 pb-20 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Gift Vouchers</h1>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <div className="w-48 h-32 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
            <Gift className="h-16 w-16 text-red-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Creating a voucher is a perfect way to gift Friends, Families or Fans.......
            Users who redeems get it instantly
          </p>
        </div>

        {/* Currency Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Select Wallet</label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Choose currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - Balance: {currency.symbol}{currency.balance.toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="text-sm font-medium mb-2 block">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {selectedCurrencyData?.symbol || "₦"}
            </span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="70,000"
              className="pl-8 h-14 text-lg"
            />
          </div>
          {selectedCurrencyData && (
            <p className="text-xs text-muted-foreground mt-1">
              *Minimum: {selectedCurrencyData.symbol}{selectedCurrencyData.minimum.toLocaleString()} {selectedCurrency}
            </p>
          )}
        </div>

        <Button 
          onClick={handleCreateVoucher}
          disabled={isLoading || !selectedCurrency || !amount}
          className="w-full h-12 text-base font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground mb-6"
        >
          {isLoading ? "Creating..." : "Create Voucher"}
        </Button>

        <div className="text-xs text-muted-foreground mb-6">
          <p>*Platform takes 10% fee on redemption</p>
          <p>*Vouchers expire after 1 year</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setCurrentStep('redeem')}
          >
            Redeem Voucher
          </Button>
        </div>

        {/* Created Vouchers History */}
        <div className="space-y-3">
          <h3 className="font-medium">Your Created Vouchers</h3>
          {userVouchers.length === 0 ? (
            <Card className="p-4">
              <p className="text-center text-muted-foreground">No vouchers created yet</p>
            </Card>
          ) : (
            userVouchers.map((voucher) => (
              <Card key={voucher.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{voucher.code}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => copyToClipboard(voucher.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {voucher.currency} {voucher.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(voucher.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    voucher.status === 'active' ? 'bg-green-100 text-green-700' :
                    voucher.status === 'redeemed' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {voucher.status}
                  </span>
                </div>
                {voucher.redeemed_by_name && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Redeemed by: {voucher.redeemed_by_name}
                  </p>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};