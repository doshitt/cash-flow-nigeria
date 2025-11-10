import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TransferData } from "@/pages/Transfer";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/config/api";

interface SendViaCryptoProps {
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
}

interface CryptoFee {
  crypto_type: string;
  network_type: string;
  blockchain_fee: number;
  min_amount: number;
}

interface PlatformFee {
  min_amount: number;
  max_amount: number | null;
  fee_type: string;
  fee_value: number;
}

export const SendViaCrypto = ({ onSubmit, onBack }: SendViaCryptoProps) => {
  const [showWarning, setShowWarning] = useState(true);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [cryptoFees, setCryptoFees] = useState<CryptoFee[]>([]);
  const [platformFees, setPlatformFees] = useState<PlatformFee[]>([]);
  const [formData, setFormData] = useState({
    cryptoType: '',
    walletAddress: '',
    networkType: '',
    amount: ''
  });
  const { wallets } = useAuth();

  const usdWallet = wallets.find(w => w.currency === 'USD');
  const usdBalance = usdWallet?.balance || 0;

  useEffect(() => {
    fetchCryptoFees();
  }, []);

  const fetchCryptoFees = async () => {
    try {
      const response = await fetch(getApiUrl('/get_transfer_fees.php?type=crypto'));
      const data = await response.json();
      if (data.success) {
        setCryptoFees(data.crypto_fees || []);
        setPlatformFees(data.platform_fees || []);
      }
    } catch (error) {
      console.error('Failed to load crypto fees:', error);
    }
  };

  const getNetworkOptions = () => {
    if (!formData.cryptoType) return [];
    return cryptoFees
      .filter(fee => fee.crypto_type === formData.cryptoType)
      .map(fee => fee.network_type);
  };

  const calculateFees = () => {
    const amount = parseFloat(formData.amount);
    if (!amount || !formData.cryptoType || !formData.networkType) {
      return { platformFee: 0, blockchainFee: 0, totalFee: 0, total: 0 };
    }

    // Calculate platform fee based on tiers
    let platformFee = 0;
    const tier = platformFees.find(f => 
      amount >= f.min_amount && (f.max_amount === null || amount <= f.max_amount)
    );
    
    if (tier) {
      if (tier.fee_type === 'percentage') {
        platformFee = amount * (tier.fee_value / 100);
      } else {
        platformFee = tier.fee_value;
      }
    }

    // Get blockchain fee
    const cryptoFee = cryptoFees.find(
      f => f.crypto_type === formData.cryptoType && f.network_type === formData.networkType
    );
    const blockchainFee = cryptoFee?.blockchain_fee || 0;
    
    const totalFee = platformFee + blockchainFee;
    const total = amount + totalFee;

    return { platformFee, blockchainFee, totalFee, total };
  };

  const getMinAmount = () => {
    const cryptoFee = cryptoFees.find(
      f => f.crypto_type === formData.cryptoType && f.network_type === formData.networkType
    );
    return cryptoFee?.min_amount || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const minAmount = getMinAmount();
    
    if (amount < minAmount) {
      alert(`Minimum amount for ${formData.cryptoType} on ${formData.networkType} is $${minAmount}`);
      return;
    }

    // Check USD wallet balance
    const fees = calculateFees();
    if (usdBalance < fees.total) {
      setShowInsufficientBalance(true);
      return;
    }
    
    onSubmit({
      type: 'crypto',
      amount: fees.total,
      currency: 'USD',
      recipientInfo: {
        cryptoType: formData.cryptoType,
        walletAddress: formData.walletAddress,
        networkType: formData.networkType,
        sendAmount: amount,
        platformFee: fees.platformFee,
        blockchainFee: fees.blockchainFee
      },
      description: `Crypto transfer - ${formData.cryptoType} (${formData.networkType})`
    });
  };

  const fees = calculateFees();
  const minAmount = getMinAmount();

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

      {/* Insufficient Balance Dialog */}
      <AlertDialog open={showInsufficientBalance} onOpenChange={setShowInsufficientBalance}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Insufficient Balance</AlertDialogTitle>
            <AlertDialogDescription>
              Kindly transfer money to your USD Wallet and try again. Your current USD balance is ${usdBalance.toFixed(2)}.
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
        <h1 className="text-lg font-semibold">Send via Crypto</h1>
      </div>

      {/* Wallet Balance */}
      <div className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">USD Wallet Balance</p>
        <p className="text-2xl font-bold">${usdBalance.toFixed(2)}</p>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cryptoType">Type of Crypto</Label>
              <Select 
                value={formData.cryptoType} 
                onValueChange={(value) => setFormData({ ...formData, cryptoType: value, networkType: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crypto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDT">Tether (USDT)</SelectItem>
                  <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                  <SelectItem value="Ethereum">Ethereum (ETH)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.cryptoType && (
              <div>
                <Label htmlFor="networkType">Network Type</Label>
                <Select 
                  value={formData.networkType} 
                  onValueChange={(value) => setFormData({ ...formData, networkType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {getNetworkOptions().map(network => (
                      <SelectItem key={network} value={network}>{network}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.networkType && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Min: ${minAmount} | Blockchain Fee: ${fees.blockchainFee}
                  </p>
                )}
              </div>
            )}

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
              {formData.amount && fees.totalFee > 0 && (
                <div className="text-xs space-y-1 mt-2 p-2 bg-muted rounded">
                  <p>Platform Fee: ${fees.platformFee.toFixed(2)}</p>
                  <p>Blockchain Fee: ${fees.blockchainFee.toFixed(2)}</p>
                  <p className="font-medium border-t pt-1">Total to Pay: ${fees.total.toFixed(2)}</p>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!formData.cryptoType || !formData.walletAddress || !formData.networkType || !formData.amount || usdBalance < fees.total}
            >
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
