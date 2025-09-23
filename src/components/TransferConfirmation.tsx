import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TransferData } from "@/pages/Transfer";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

interface TransferConfirmationProps {
  transferData: TransferData;
  onBack: () => void;
  onSuccess: () => void;
}

export const TransferConfirmation = ({ transferData, onBack, onSuccess }: TransferConfirmationProps) => {
  const [pin, setPin] = useState(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const getRecipientDisplay = () => {
    switch (transferData.type) {
      case 'tesapay':
        return transferData.recipientInfo.username;
      case 'nigeria':
        return `${transferData.recipientInfo.bankName} Account`;
      case 'international':
        return transferData.recipientInfo.accountName;
      default:
        return 'Recipient';
    }
  };

  const handleSendNow = async () => {
    const pinValue = pin.join('');
    if (pinValue.length !== 5) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your 5-digit transaction PIN",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl('/transfers.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          transfer_type: transferData.type,
          amount: transferData.amount,
          currency: transferData.currency,
          recipient_info: transferData.recipientInfo,
          description: transferData.description,
          transaction_pin: pinValue
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Transfer Successful",
          description: "Your money has been sent successfully!",
        });
        onSuccess();
      } else {
        toast({
          title: "Transfer Failed",
          description: result.message || "Failed to process transfer",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
      <div className="flex items-center gap-3 p-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 space-y-8">
        {/* Illustration */}
        <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-6xl">💸</div>
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">
            Does everything looks okay ???
          </h2>
          <p className="text-lg">
            Confirm you sending {transferData.currency === 'NGN' ? '₦' : transferData.currency === 'USD' ? '$' : transferData.currency === 'GBP' ? '£' : transferData.currency === 'EUR' ? '€' : '₵'}{transferData.amount.toLocaleString()} to {getRecipientDisplay()}
          </p>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <p className="text-center text-destructive font-medium">
            Enter transaction pin
          </p>
          <div className="flex gap-3 justify-center">
            {pin.map((digit, index) => (
              <Input
                key={index}
                id={`pin-${index}`}
                type="password"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center bg-muted"
              />
            ))}
          </div>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <Button
            onClick={handleSendNow}
            disabled={isLoading || pin.join('').length !== 5}
            className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-base"
          >
            {isLoading ? "Processing..." : "Send now"}
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full h-12 text-base font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};