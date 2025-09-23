import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";

interface VoucherRedeemSuccessProps {
  amount: number;
  currency: string;
  onDone: () => void;
}

export const VoucherRedeemSuccess = ({ amount, currency, onDone }: VoucherRedeemSuccessProps) => {
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'GHS': return '₵';
      case 'NGN': 
      default: return '₦';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
          <ThumbsUp className="h-12 w-12 text-primary" />
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Boilla!!!
          </h2>
          <p className="text-base text-muted-foreground">
            Voucher redeemed
            Successful to your Balance.
          </p>
          <p className="text-lg font-semibold text-primary">
            +{getCurrencySymbol(currency)}{amount.toLocaleString()} {currency}
          </p>
        </div>

        <div className="w-full max-w-sm mt-8">
          <Button
            onClick={onDone}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 text-base font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};