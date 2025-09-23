import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Gift } from "lucide-react";

interface VoucherRedeemProps {
  onBack: () => void;
  redeemCode: string;
  setRedeemCode: (code: string) => void;
  onRedeem: () => void;
  isLoading: boolean;
}

export const VoucherRedeem = ({ onBack, redeemCode, setRedeemCode, onRedeem, isLoading }: VoucherRedeemProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          {/* Illustration */}
          <div className="w-48 h-32 bg-gradient-to-br from-pink-100 to-red-200 rounded-lg flex items-center justify-center">
            <Gift className="h-16 w-16 text-red-500" />
          </div>

          <div className="text-center space-y-4 max-w-sm">
            <h2 className="text-xl font-semibold text-foreground">
              Redeem Voucher with code below,
              Instantly reflects in your wallet.
            </h2>
          </div>

          <div className="w-full max-w-sm space-y-6">
            <Input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              placeholder="Input Coupon Code"
              className="h-12 text-center text-lg"
            />

            <Button
              onClick={onRedeem}
              disabled={isLoading || !redeemCode.trim()}
              className="w-full h-12 text-base font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isLoading ? "Redeeming..." : "Redeem"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};