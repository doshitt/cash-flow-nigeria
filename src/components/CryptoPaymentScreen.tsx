import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface CryptoPaymentScreenProps {
  onBack: () => void;
}

export const CryptoPaymentScreen = ({ onBack }: CryptoPaymentScreenProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const walletAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const handleCryptoSent = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmPayment = () => {
    toast({
      title: "Payment Request Submitted",
      description: "Your crypto payment request has been sent to admin for verification",
    });
    setShowConfirmDialog(false);
    onBack();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Add money via crypto</h2>
        <p className="text-sm text-muted-foreground">
          Send USDT to the address below and it will reflect in your USD wallet
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Cryptocurrency</div>
          <div className="font-semibold text-lg">USDT</div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Network</div>
          <div className="font-semibold">TRC20</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Wallet Address</div>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm font-mono break-all">
              {walletAddress}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyWalletAddress}
              className="h-8 w-8 shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Instructions:</strong> Send the USDT amount to the above address and it will reflect in your USD wallet in minutes.
          </p>
        </div>
      </Card>

      <Button className="w-full" onClick={handleCryptoSent}>
        Crypto Sent
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Crypto Payment</DialogTitle>
            <DialogDescription>
              Are you sure you have sent the USDT to the provided wallet address?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleConfirmPayment}
            >
              Confirmed
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};