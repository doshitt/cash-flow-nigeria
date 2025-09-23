import { Button } from "@/components/ui/button";

interface TransactionSuccessProps {
  onDone: () => void;
  onShowReceipt: () => void;
}

export const TransactionSuccess = ({ onDone, onShowReceipt }: TransactionSuccessProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 space-y-8">
        {/* Illustration placeholder */}
        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-4xl">✅</div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Transaction Successful!!!
          </h2>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <Button
            onClick={onShowReceipt}
            variant="outline"
            className="flex-1 h-12 text-base font-semibold border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Share Receipt
          </Button>
          <Button
            onClick={onDone}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 text-base font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};