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

      const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

      const reqUser = user
        ? {
            user_id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            full_name: user.full_name,
          }
        : {
            user_id: API_CONFIG.DEV_USER.user_id,
            email: API_CONFIG.DEV_USER.email,
            first_name: API_CONFIG.DEV_USER.first_name,
            last_name: API_CONFIG.DEV_USER.last_name,
            phone: API_CONFIG.DEV_USER.phone,
            full_name: `${API_CONFIG.DEV_USER.first_name} ${API_CONFIG.DEV_USER.last_name}`,
          };

      if (isLocal) {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CREATE_VIRTUAL_ACCOUNT), {
          method: "POST",
          headers: API_CONFIG.DEFAULT_HEADERS,
          body: JSON.stringify({
            user_id: reqUser.user_id,
            email: reqUser.email,
            first_name: reqUser.first_name,
            last_name: reqUser.last_name,
            phone: reqUser.phone,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setAccountDetails({
            accountHolder: data.data.account_name,
            accountNumber: data.data.account_number,
            bankName: data.data.bank_name,
          });
          toast({
            title: "Success",
            description: "Virtual account details loaded successfully",
          });
        } else {
          throw new Error(data.message || "Failed to create virtual account");
        }
      } else {
        // Preview/hosted environment: show demo details (no real API calls allowed)
        await new Promise((resolve) => setTimeout(resolve, 800));
        setAccountDetails({
          accountHolder: reqUser.full_name,
          accountNumber: "9999999999",
          bankName: "Titan Trust Bank",
        });
        toast({
          title: "Demo mode",
          description: "Run locally to use your PHP backend or provide a live HTTPS backend URL.",
        });
      }
    } catch (error) {
      console.error("Error creating virtual account:", error);
      toast({
        title: "Error",
        description: "Failed to load virtual account details",
        variant: "destructive",
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