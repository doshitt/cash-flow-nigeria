import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransferData } from "@/pages/Transfer";

interface SendToNigeriaBankProps {
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
}

const nigerianBanks = [
  'Access Bank',
  'Guaranty Trust Bank',
  'United Bank for Africa',
  'Zenith Bank',
  'First Bank of Nigeria',
  'Ecobank Nigeria',
  'Stanbic IBTC Bank',
  'Sterling Bank',
  'Union Bank of Nigeria',
  'Wema Bank',
  'Fidelity Bank',
  'FCMB',
  'Kuda Bank',
  'Opay',
  'PalmPay'
];

export const SendToNigeriaBank = ({ onSubmit, onBack }: SendToNigeriaBankProps) => {
  const [formData, setFormData] = useState({
    accountNumber: '',
    selectedBank: '',
    amount: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transferData: TransferData = {
      type: 'nigeria',
      amount: parseFloat(formData.amount),
      currency: 'NGN',
      recipientInfo: {
        accountNumber: formData.accountNumber,
        bankName: formData.selectedBank
      },
      description: formData.description
    };

    onSubmit(transferData);
  };

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
        <h1 className="text-lg font-semibold">Send to Nigeria User</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Recipient Account Number</Label>
          <Input
            id="accountNumber"
            placeholder="Enter account number"
            value={formData.accountNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
            className="h-12 bg-muted"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank">Select Bank</Label>
          <Select value={formData.selectedBank} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedBank: value }))}>
            <SelectTrigger className="w-full h-12 bg-muted">
              <SelectValue placeholder="First bank" />
            </SelectTrigger>
            <SelectContent>
              {nigerianBanks.map((bank) => (
                <SelectItem key={bank} value={bank}>
                  {bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-destructive">• Account name comes up automatically</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount to send</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              ₦
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
          disabled={!formData.accountNumber || !formData.selectedBank || !formData.amount}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};