import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AirtimeConfirmationProps {
  onBack: () => void;
  onConfirm: () => void;
  phoneNumber: string;
  amount: number;
}

export const AirtimeConfirmation = ({ onBack, onConfirm, phoneNumber, amount }: AirtimeConfirmationProps) => {
  // Calculate fee (assumed 4% fee based on the screenshot showing ₦480 pay for ₦500)
  const fee = Math.round(amount * 0.04);
  const totalAmount = amount - fee;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-destructive" />
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 space-y-8">
        {/* Illustration placeholder */}
        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-4xl">📱</div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">
            Confirm Purchase
          </h2>
          <p className="text-base text-muted-foreground max-w-sm">
            You pay ₦{totalAmount} and receive ₦{amount} of Airtime to {phoneNumber}
          </p>
        </div>

        <Button
          onClick={onConfirm}
          className="w-full max-w-sm bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 text-base font-semibold"
        >
          Confirm and Pay
        </Button>
      </div>
    </div>
  );
};