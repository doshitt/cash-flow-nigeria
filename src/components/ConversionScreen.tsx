import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { API_CONFIG, getApiUrl } from "@/config/api";

interface ConversionScreenProps {
  onBack: () => void;
  selectedCurrency: string;
}

const currencyInfo = {
  USD: { name: "US Dollar", symbol: "$" },
  NGN: { name: "Nigerian Naira", symbol: "₦" },
  GBP: { name: "British Pound", symbol: "£" },
  EUR: { name: "Euro", symbol: "€" },
  GHS: { name: "Ghanaian Cedi", symbol: "₵" }
};

const exchangeRates: Record<string, Record<string, number>> = {
  NGN: { USD: 0.0013, GBP: 0.0010, EUR: 0.0012 },
  USD: { NGN: 770, GBP: 0.79, EUR: 0.92 },
  GBP: { NGN: 1000, USD: 1.27, EUR: 1.16 },
  EUR: { NGN: 833, USD: 1.09, GBP: 0.86 }
};

export const ConversionScreen = ({ onBack, selectedCurrency }: ConversionScreenProps) => {
  const { user, wallets } = useAuth();
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState(selectedCurrency);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fromWallet = wallets?.find(w => w.currency === fromCurrency);
  const toWallet = wallets?.find(w => w.currency === toCurrency);
  const fromInfo = currencyInfo[fromCurrency as keyof typeof currencyInfo];
  const toInfo = currencyInfo[toCurrency as keyof typeof currencyInfo];

  const getExchangeRate = () => {
    if (!fromCurrency || !toCurrency) return 1;
    return exchangeRates[fromCurrency]?.[toCurrency] || 1;
  };

  const exchangeRate = getExchangeRate();
  const convertedAmount = parseFloat(amount || "0") * exchangeRate;

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleConvert = async () => {
    if (!fromCurrency || !toCurrency || !amount || !user) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = fromWallet?.balance ? Number(fromWallet.balance) : 0;
    
    if (amountNum > balanceNum) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${fromCurrency} to convert`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/convert_currency.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          from_currency: fromCurrency,
          to_currency: toCurrency,
          amount: parseFloat(amount)
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Conversion Successful",
          description: `Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`,
        });
        setTimeout(() => onBack(), 1500);
      } else {
        toast({
          title: "Conversion Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process conversion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Currency Conversion</h2>
          <p className="text-sm text-muted-foreground">
            Convert funds between your wallets
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="from-currency">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {wallets?.filter(w => w.currency !== toCurrency).map((wallet) => {
                const info = currencyInfo[wallet.currency as keyof typeof currencyInfo];
                return (
                  <SelectItem key={wallet.id} value={wallet.currency}>
                    <div className="flex items-center justify-between w-full">
                      <span>{wallet.currency} - {info?.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {info?.symbol}{Number(wallet.balance).toLocaleString()}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {fromWallet && fromInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              Available: {fromInfo.symbol}{Number(fromWallet.balance).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapCurrencies}
            className="rounded-full"
          >
            <ArrowUpDown className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <Label htmlFor="to-currency">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {wallets?.filter(w => w.currency !== fromCurrency).map((wallet) => {
                const info = currencyInfo[wallet.currency as keyof typeof currencyInfo];
                return (
                  <SelectItem key={wallet.id} value={wallet.currency}>
                    <div className="flex items-center justify-between w-full">
                      <span>{wallet.currency} - {info?.name}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {info?.symbol}{Number(wallet.balance).toLocaleString()}
                      </span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {fromCurrency && toCurrency && amount && (
          <Card className="p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Exchange rate:</span>
                <span>1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
              </div>
              <div className="flex justify-between font-medium text-base">
                <span>You'll receive:</span>
                <span>{toInfo?.symbol}{convertedAmount.toFixed(2)} {toCurrency}</span>
              </div>
            </div>
          </Card>
        )}

        <Button 
          className="w-full" 
          onClick={handleConvert}
          disabled={!fromCurrency || !toCurrency || !amount || isLoading}
        >
          {isLoading ? "Converting..." : "Convert Now"}
        </Button>
      </div>
    </div>
  );
};