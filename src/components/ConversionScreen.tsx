import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversionScreenProps {
  onBack: () => void;
  selectedCurrency: string;
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$", balance: 1250.00 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", balance: 850000.00 },
  { code: "GBP", name: "British Pound", symbol: "£", balance: 920.50 },
  { code: "EUR", name: "Euro", symbol: "€", balance: 1100.75 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", balance: 7500.00 }
];

export const ConversionScreen = ({ onBack, selectedCurrency }: ConversionScreenProps) => {
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState(selectedCurrency);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const fromCurrencyData = currencies.find(c => c.code === fromCurrency);
  const toCurrencyData = currencies.find(c => c.code === toCurrency);

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleConvert = () => {
    if (!fromCurrency || !toCurrency || !amount) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conversion Successful",
      description: `Converted ${amount} ${fromCurrency} to ${toCurrency}`,
    });
    onBack();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Currency Conversion</h2>
        <p className="text-sm text-muted-foreground">
          Convert funds between your wallets
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="from-currency">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.filter(c => c.code !== toCurrency).map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{currency.code} - {currency.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {currency.symbol}{currency.balance.toLocaleString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fromCurrencyData && (
            <p className="text-sm text-muted-foreground mt-1">
              Available: {fromCurrencyData.symbol}{fromCurrencyData.balance.toLocaleString()}
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
              {currencies.filter(c => c.code !== fromCurrency).map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center justify-between w-full">
                    <span>{currency.code} - {currency.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {currency.symbol}{currency.balance.toLocaleString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
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
            <div className="text-sm">
              <div className="flex justify-between mb-2">
                <span>Exchange rate:</span>
                <span>1 {fromCurrency} = 1.2 {toCurrency}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>You'll receive:</span>
                <span>{(parseFloat(amount) * 1.2).toFixed(2)} {toCurrency}</span>
              </div>
            </div>
          </Card>
        )}

        <Button 
          className="w-full" 
          onClick={handleConvert}
          disabled={!fromCurrency || !toCurrency || !amount}
        >
          Convert Now
        </Button>
      </div>
    </div>
  );
};