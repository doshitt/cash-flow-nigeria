import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransferData } from "@/pages/Transfer";

interface SendToTesapayUserProps {
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
}

const currencies = [
  { code: 'NGN', symbol: '₦', flag: '🇳🇬' },
  { code: 'USD', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺' },
  { code: 'GHS', symbol: '₵', flag: '🇬🇭' }
];

export const SendToTesapayUser = ({ onSubmit, onBack }: SendToTesapayUserProps) => {
  const [formData, setFormData] = useState({
    fromCurrency: 'GBP',
    recipientUsername: '',
    amount: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transferData: TransferData = {
      type: 'tesapay',
      amount: parseFloat(formData.amount),
      currency: formData.fromCurrency,
      recipientInfo: {
        username: formData.recipientUsername,
        fromCurrency: formData.fromCurrency
      },
      description: formData.description
    };

    onSubmit(transferData);
  };

  const selectedCurrency = currencies.find(c => c.code === formData.fromCurrency);

  return (
    <div className="min-h-screen bg-background">
      {/* Status bar */}
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
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Send to Tesapay User</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fromCurrency">Send From</Label>
          <Select value={formData.fromCurrency} onValueChange={(value) => setFormData(prev => ({ ...prev, fromCurrency: value }))}>
            <SelectTrigger className="w-full h-12 bg-muted">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>{currencies.find(c => c.code === formData.fromCurrency)?.flag}</span>
                  <span>{formData.fromCurrency}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span>{currency.flag}</span>
                    <span>{currency.code}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recipientUsername">Recipient Username</Label>
          <Input
            id="recipientUsername"
            placeholder="John"
            value={formData.recipientUsername}
            onChange={(e) => setFormData(prev => ({ ...prev, recipientUsername: e.target.value }))}
            className="h-12 bg-muted"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount to send</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {selectedCurrency?.symbol}
            </span>
            <Input
              id="amount"
              type="number"
              placeholder="70,000"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="h-12 bg-muted pl-8"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Add a note..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-24 bg-muted resize-none"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-base"
          disabled={!formData.recipientUsername || !formData.amount}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};