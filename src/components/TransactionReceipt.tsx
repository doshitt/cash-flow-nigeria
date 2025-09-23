import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TransactionReceiptProps {
  onBack: () => void;
  transactionData: {
    amount: number;
    phoneNumber: string;
    date: string;
    time: string;
    status: string;
    operator: string;
    transactionId: string;
  };
}

export const TransactionReceipt = ({ onBack, transactionData }: TransactionReceiptProps) => {
  const handleShare = () => {
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: `Airtime purchase of ₦${transactionData.amount} to ${transactionData.phoneNumber}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
        {/* Illustration placeholder */}
        <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-2xl">📱</div>
        </div>

        <Card className="w-full max-w-sm bg-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-semibold text-foreground">
              Transaction Receipt
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {transactionData.date} {transactionData.time}
              </span>
              <div className="w-8 h-6 bg-destructive rounded flex items-center justify-center">
                <span className="text-xs text-destructive-foreground font-bold">T</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Amount:</span>
              <span className="text-foreground">₦ {transactionData.amount}.00</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Status:</span>
              <span className="text-foreground">{transactionData.status}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Operators:</span>
              <span className="text-foreground">{transactionData.operator}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Number:</span>
              <span className="text-foreground">{transactionData.phoneNumber}</span>
            </div>
          </div>

          <Button
            onClick={handleShare}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 text-base font-semibold mt-6"
          >
            Share Receipt
          </Button>
        </Card>

        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">Support</p>
          <p className="text-sm text-destructive">Support@tesapay.com</p>
        </div>

        <Button
          onClick={onBack}
          variant="ghost"
          className="mt-4"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
};