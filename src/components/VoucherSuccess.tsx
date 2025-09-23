import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoucherSuccessProps {
  voucherCode: string;
  onDone: () => void;
  onCreateNew: () => void;
}

export const VoucherSuccess = ({ voucherCode, onDone, onCreateNew }: VoucherSuccessProps) => {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(voucherCode);
    toast({
      title: "Copied!",
      description: "Voucher code copied to clipboard"
    });
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
            Yolla!!!
          </h2>
          <p className="text-base text-muted-foreground max-w-sm">
            Coupon Voucher Created Successful
            Share the code with Fans, family to redeem
          </p>
        </div>

        {/* Voucher Code */}
        <div className="flex items-center gap-2 p-4 border-2 border-destructive rounded-lg">
          <span className="text-lg font-bold text-destructive">{voucherCode}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="p-2 h-auto"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-4 w-full max-w-sm mt-8">
          <Button
            onClick={onCreateNew}
            variant="outline"
            className="flex-1 h-12 text-base font-semibold border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            Create New
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