import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BankTransferScreenProps {
  onBack: () => void;
}

export const BankTransferScreen = ({ onBack }: BankTransferScreenProps) => {
  const { toast } = useToast();

  // In a real app, this would come from user's virtual account data
  // For now using dynamic data that would be fetched from your backend
  const accountDetails = {
    accountHolder: "User Full Name", // This would be fetched from user profile
    accountNumber: "Loading...", // This would be the Paystack virtual account number
    bankName: "Wema Bank PLC" // This would be from Paystack virtual account response
  };

  // This function would make API call to create/get virtual account
  const getVirtualAccount = async () => {
    // Example API call structure:
    /*
    const response = await fetch('/api/create-virtual-account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: userEmail,
        first_name: userFirstName,
        last_name: userLastName,
        phone: userPhone
      })
    });
    const data = await response.json();
    */
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Add money via bank transfer</h2>
        <p className="text-sm text-muted-foreground">
          Make a transfer to your account details below
        </p>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Share details
        </Button>
        <Button variant="outline" className="flex-1">
          About this account
        </Button>
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            Sterling Bank PLC
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Wema Bank PLC
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Account holder</label>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">{accountDetails.accountHolder}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(accountDetails.accountHolder, "Account holder")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Account number</label>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">{accountDetails.accountNumber}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(accountDetails.accountNumber, "Account number")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Bank name</label>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium">{accountDetails.bankName}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyToClipboard(accountDetails.bankName, "Bank name")}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};