import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface BankTransferScreenProps {
  onBack: () => void;
}

export const BankTransferScreen = ({ onBack }: BankTransferScreenProps) => {
  const { toast } = useToast();
  const [accountDetails, setAccountDetails] = useState({
    accountHolder: "Loading...",
    accountNumber: "Loading...",
    bankName: "Loading..."
  });
  const [loading, setLoading] = useState(true);

  // Function to create/get virtual account from Paystack
  const createVirtualAccount = async () => {
    try {
      setLoading(true);
      
      // Replace with your actual backend URL
      const response = await fetch('http://localhost/backend/create_virtual_account.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: 1, // Replace with actual user ID from your auth system
          email: 'user@example.com', // Replace with actual user email
          first_name: 'John', // Replace with actual user first name
          last_name: 'Doe', // Replace with actual user last name
          phone: '+2348123456789' // Replace with actual user phone
        })
      });

      const data = await response.json();
      console.log('Virtual account response:', data);

      if (data.success) {
        setAccountDetails({
          accountHolder: data.data.account_name,
          accountNumber: data.data.account_number,
          bankName: data.data.bank_name
        });
        toast({
          title: "Success",
          description: "Virtual account details loaded successfully",
        });
      } else {
        throw new Error(data.message || 'Failed to create virtual account');
      }
    } catch (error) {
      console.error('Error creating virtual account:', error);
      toast({
        title: "Error",
        description: "Failed to load virtual account details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createVirtualAccount();
  }, []);

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