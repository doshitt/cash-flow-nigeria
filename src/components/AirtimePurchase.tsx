import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AirtimePurchaseProps {
  onBack: () => void;
  onConfirm: (data: { phoneNumber: string; amount: number }) => void;
}

const predefinedAmounts = [500, 500, 500, 500, 500, 500];

export const AirtimePurchase = ({ onBack, onConfirm }: AirtimePurchaseProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleBuy = () => {
    if (phoneNumber && amount) {
      const amountValue = parseInt(amount);
      if (amountValue < 100) {
        return; // Minimum amount validation
      }
      onConfirm({
        phoneNumber,
        amount: amountValue
      });
    }
  };

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

      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-base font-medium text-foreground">
              Enter a phone number to buy Airtime:
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="081xxxxxxxx"
              className="border-destructive focus-visible:ring-destructive"
            />
          </div>

          <div className="space-y-2">
            <label className="text-base font-medium text-foreground">
              Amount
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="border-destructive focus-visible:ring-destructive"
            />
          </div>
        </div>

        <Button
          onClick={handleBuy}
          disabled={!phoneNumber || !amount}
          className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground h-12 text-base font-semibold"
        >
          Buy
        </Button>

        {/* Predefined Amounts */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {predefinedAmounts.map((amt, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => handleAmountSelect(amt)}
              className="h-12 bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90"
            >
              ₦ {amt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};