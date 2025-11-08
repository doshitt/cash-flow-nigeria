import { Button } from "@/components/ui/button";

interface TransactionSuccessProps {
  onDone: () => void;
  onShowReceipt: () => void;
  token?: string;
  tokenLabel?: string;
}

export const TransactionSuccess = ({ onDone, onShowReceipt, token, tokenLabel = "Prepaid Token" }: TransactionSuccessProps) => {
  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
    } catch {
      // no-op
    }
  };

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
          {token && (
            <div className="w-full max-w-sm mx-auto border rounded-lg p-4 bg-muted/40">
              <p className="text-sm text-muted-foreground mb-2">{tokenLabel}</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2 rounded-md bg-background border text-foreground font-mono tracking-wider">
                  {token}
                </div>
                <Button variant="outline" onClick={handleCopy}>Copy</Button>
              </div>
            </div>
          )}
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