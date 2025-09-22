import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG, getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

interface BankTransferScreenProps {
  onBack: () => void;
}

export const BankTransferScreen = ({ onBack }: BankTransferScreenProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
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
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // For development, let's mock the response since localhost won't work in preview
      // In production, this would call your actual backend
      console.log('Creating virtual account for user:', user);
      
      // Mock successful response for development
      const mockResponse = {
        success: true,
        data: {
          account_name: user.full_name,
          account_number: "7085469825",
          bank_name: "Wema Bank",
          bank_code: "wema-bank"
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAccountDetails({
        accountHolder: mockResponse.data.account_name,
        accountNumber: mockResponse.data.account_number,
        bankName: mockResponse.data.bank_name
      });

      toast({
        title: "Success",
        description: "Virtual account details loaded successfully",
      });
      
      /* 
      // Real API call for when running locally:
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_VIRTUAL_ACCOUNT), {
        method: 'POST',
        headers: API_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify({
          user_id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone
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
      */
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