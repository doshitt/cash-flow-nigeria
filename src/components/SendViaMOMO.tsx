import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TransferData } from "@/pages/Transfer";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/config/api";

interface SendViaMOMOProps {
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
}

interface MOMOFee {
  min_amount: number;
  max_amount: number;
  platform_fee: number;
}

export const SendViaMOMO = ({ onSubmit, onBack }: SendViaMOMOProps) => {
  const [showWarning, setShowWarning] = useState(true);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [momoFees, setMomoFees] = useState<MOMOFee[]>([]);
  const [formData, setFormData] = useState({
    momoNumber: '',
    momoName: '',
    amount: ''
  });
  const { wallets } = useAuth();

  const ghsWallet = wallets.find(w => w.currency === 'GHS');
  const ghsBalance = ghsWallet?.balance || 0;

  const MIN_TRANSFER = 5;
  const MAX_TRANSFER = 1000;

  useEffect(() => {
    fetchMomoFees();
  }, []);

  const fetchMomoFees = async () => {
    try {
      const response = await fetch(getApiUrl('/get_transfer_fees.php?type=momo'));
      const data = await response.json();
      if (data.success) {
        setMomoFees(data.momo_fees || []);
      }
    } catch (error) {
      console.error('Failed to load MOMO fees:', error);
    }
  };

  const calculatePlatformFee = () => {
    const amount = parseFloat(formData.amount);
    if (!amount) return 0;

    const tier = momoFees.find(f => 
      amount >= f.min_amount && amount <= f.max_amount
    );
    
    return tier?.platform_fee || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    
    // Validate min/max
    if (amount < MIN_TRANSFER) {
      alert(`Minimum transfer amount is ₵${MIN_TRANSFER}`);
      return;
    }
    
    if (amount > MAX_TRANSFER) {
      alert(`Maximum transfer amount is ₵${MAX_TRANSFER}`);
      return;
    }

    const platformFee = calculatePlatformFee();
    const totalDeduction = amount + platformFee;

    // Check GHS wallet balance
    if (ghsBalance < totalDeduction) {
      setShowInsufficientBalance(true);
      return;
    }
    
    onSubmit({
      type: 'momo',
      amount: totalDeduction,
      currency: 'GHS',
      recipientInfo: {
        momoNumber: formData.momoNumber,
        momoName: formData.momoName,
        sendAmount: amount,
        platformFee: platformFee
      },
      description: `MOMO transfer to ${formData.momoName}`
    });
  };

  const platformFee = calculatePlatformFee();
  const amount = parseFloat(formData.amount) || 0;
  const totalDeduction = amount + platformFee;

  return (
    <div className="min-h-screen bg-background">
      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Important Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Every MOMO transaction is non-reversible. Please ensure your MOMO details are correct before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarning(false)}>
              OK, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Insufficient Balance Dialog */}
      <AlertDialog open={showInsufficientBalance} onOpenChange={setShowInsufficientBalance}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Balance</AlertDialogTitle>
            <AlertDialogDescription>
              Kindly transfer money to your GHS Wallet and try again. Your current GHS balance is ₵{ghsBalance.toFixed(2)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowInsufficientBalance(false)}>
              OK
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
        <h1 className="text-lg font-semibold">Send via MOMO</h1>
      </div>

      {/* Wallet Balance */}
      <div className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">GHS Wallet Balance</p>
        <p className="text-2xl font-bold">₵{ghsBalance.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Min: ₵{MIN_TRANSFER} | Max: ₵{MAX_TRANSFER}
        </p>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="momoNumber">MOMO Number</Label>
              <Input
                id="momoNumber"
                type="tel"
                placeholder="e.g. 0244123456"
                value={formData.momoNumber}
                onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="momoName">Name on MOMO Number</Label>
              <Input
                id="momoName"
                type="text"
                placeholder="Enter recipient name"
                value={formData.momoName}
                onChange={(e) => setFormData({ ...formData, momoName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (GHS)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
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
              {formData.amount && platformFee > 0 && (
                <div className="text-xs space-y-1 mt-2 p-2 bg-muted rounded">
                  <p>Transfer Amount: ₵{amount.toFixed(2)}</p>
                  <p>Platform Fee: ₵{platformFee.toFixed(2)}</p>
                  <p className="font-medium border-t pt-1">Total to Pay: ₵{totalDeduction.toFixed(2)}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                This will be deducted from your Ghana Cedis wallet
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={
                !formData.momoNumber || 
                !formData.momoName || 
                !formData.amount || 
                amount < MIN_TRANSFER || 
                amount > MAX_TRANSFER ||
                ghsBalance < totalDeduction
              }
            >
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
