import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TransferData } from "@/pages/Transfer";

interface SendViaCryptoProps {
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
}

export const SendViaCrypto = ({ onSubmit, onBack }: SendViaCryptoProps) => {
  const [showWarning, setShowWarning] = useState(true);
  const [formData, setFormData] = useState({
    cryptoType: '',
    walletAddress: '',
    networkType: '',
    amount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    const fee = amount * 0.10; // 10% transaction fee
    
    onSubmit({
      type: 'crypto',
      amount: amount + fee,
      currency: 'USD',
      recipientInfo: {
        cryptoType: formData.cryptoType,
        walletAddress: formData.walletAddress,
        networkType: formData.networkType,
        transactionFee: fee
      },
      description: `Crypto transfer - ${formData.cryptoType} (${formData.networkType})`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Important Notice</AlertDialogTitle>
            <AlertDialogDescription>
              All crypto transactions are non-reversible. Ensure wallet address and network type are correct before sending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarning(false)}>
              OK, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        <h1 className="text-lg font-semibold">Send via Crypto</h1>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cryptoType">Type of Crypto</Label>
              <Select value={formData.cryptoType} onValueChange={(value) => setFormData({ ...formData, cryptoType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select crypto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bitcoin">Bitcoin (BTC)</SelectItem>
                  <SelectItem value="Ethereum">Ethereum (ETH)</SelectItem>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="walletAddress">Recipient Wallet Address</Label>
              <Input
                id="walletAddress"
                type="text"
                placeholder="Enter wallet address"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="networkType">Network Type</Label>
              <Input
                id="networkType"
                type="text"
                placeholder="e.g. TRC20, ERC20, BEP20"
                value={formData.networkType}
                onChange={(e) => setFormData({ ...formData, networkType: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              {formData.amount && (
                <p className="text-xs text-muted-foreground mt-1">
                  Transaction fee: ${(parseFloat(formData.amount) * 0.10).toFixed(2)} (10%)
                  <br />
                  Total deduction: ${(parseFloat(formData.amount) * 1.10).toFixed(2)}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!formData.cryptoType || !formData.walletAddress || !formData.networkType || !formData.amount}
            >
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};