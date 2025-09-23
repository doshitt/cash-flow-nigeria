import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransferData } from "@/pages/Transfer";

interface SendToInternationalBankProps {
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
}

const paymentMethods = [
  { value: 'paypal', label: 'PayPal' },
  { value: 'wise', label: 'Wise (formerly TransferWise)' },
  { value: 'remitly', label: 'Remitly' },
  { value: 'worldremit', label: 'WorldRemit' },
  { value: 'western_union', label: 'Western Union' }
];

export const SendToInternationalBank = ({ onSubmit, onBack }: SendToInternationalBankProps) => {
  const [formData, setFormData] = useState({
    paymentMethod: 'paypal',
    email: '',
    accountName: '',
    amount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transferData: TransferData = {
      type: 'international',
      amount: parseFloat(formData.amount),
      currency: 'USD', // Default to USD for international
      recipientInfo: {
        paymentMethod: formData.paymentMethod,
        email: formData.email,
        accountName: formData.accountName
      }
    };

    onSubmit(transferData);
  };

  const getEmailLabel = () => {
    switch (formData.paymentMethod) {
      case 'paypal':
        return 'PayPal Email';
      case 'wise':
        return 'Wise Email';
      case 'remitly':
        return 'Remitly Email';
      case 'worldremit':
        return 'WorldRemit Email';
      case 'western_union':
        return 'Western Union Email';
      default:
        return 'Email';
    }
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
        <h1 className="text-lg font-semibold">Send to International User</h1>
      </div>

      {/* Tagline */}
      <div className="p-4 text-center">
        <h2 className="text-destructive font-semibold text-sm">
          SEND PAYMENT INTERNATIONALLY TO<br />
          YOUR LOVED ONES IN A SEC
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Select country/ payment method</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
            <SelectTrigger className="w-full h-12 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{getEmailLabel()}</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="h-12 bg-muted"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountName">Account Name</Label>
          <Input
            id="accountName"
            placeholder="Enter account name"
            value={formData.accountName}
            onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
            className="h-12 bg-muted"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="h-12 bg-muted"
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-base"
          disabled={!formData.email || !formData.accountName || !formData.amount}
        >
          Continue
        </Button>
      </form>
    </div>
  );
};