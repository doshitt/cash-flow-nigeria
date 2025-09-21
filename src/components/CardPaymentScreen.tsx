import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface CardPaymentScreenProps {
  onBack: () => void;
  selectedCurrency: string;
}

export const CardPaymentScreen = ({ onBack, selectedCurrency }: CardPaymentScreenProps) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    amount: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D+/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleAddMoney = () => {
    const { cardNumber, expiryDate, cvv, cardName, amount } = cardDetails;
    
    if (!cardNumber || !expiryDate || !cvv || !cardName || !amount) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if card name matches user name (simplified check)
    const userName = "Seun Hammed Muili"; // This would come from user context
    if (cardName.toLowerCase() !== userName.toLowerCase()) {
      toast({
        title: "Card Rejected",
        description: "The name on the card must match your account name",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Payment Processing",
      description: `Adding ${amount} ${selectedCurrency} to your wallet`,
    });
    onBack();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Add money via card</h2>
        <p className="text-sm text-muted-foreground">
          Enter your card details to top up your {selectedCurrency} wallet
        </p>
      </div>

      <Card className="p-4 space-y-4">
        <div>
          <Label htmlFor="amount">Amount ({selectedCurrency})</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={cardDetails.amount}
            onChange={(e) => handleInputChange("amount", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="card-number">Card Number</Label>
          <Input
            id="card-number"
            placeholder="1234 5678 9012 3456"
            value={cardDetails.cardNumber}
            onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              type="password"
              value={cardDetails.cvv}
              onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, '').substring(0, 4))}
              maxLength={4}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="card-name">Name on Card</Label>
          <Input
            id="card-name"
            placeholder="Enter name as it appears on card"
            value={cardDetails.cardName}
            onChange={(e) => handleInputChange("cardName", e.target.value)}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Must match your account name exactly
          </p>
        </div>
      </Card>

      <Button 
        className="w-full" 
        onClick={handleAddMoney}
        disabled={!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardName || !cardDetails.amount}
      >
        Add Money
      </Button>
    </div>
  );
};