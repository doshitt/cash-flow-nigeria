import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { SendToTesapayUser } from "@/components/SendToTesapayUser";
import { SendToNigeriaBank } from "@/components/SendToNigeriaBank";
import { SendToInternationalBank } from "@/components/SendToInternationalBank";
import { TransferConfirmation } from "@/components/TransferConfirmation";
import { useFeatures } from "@/hooks/useFeatures";

export type TransferType = 'tesapay' | 'nigeria' | 'international' | null;

export interface TransferData {
  type: TransferType;
  amount: number;
  currency: string;
  recipientInfo: any;
  description?: string;
}

const Transfer = () => {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatures();
  const [selectedType, setSelectedType] = useState<TransferType>(null);
  const [transferData, setTransferData] = useState<TransferData | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBack = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else if (selectedType) {
      setSelectedType(null);
    } else {
      navigate('/');
    }
  };

  const handleTransferSubmit = (data: TransferData) => {
    setTransferData(data);
    setShowConfirmation(true);
  };

  const renderTransferForm = () => {
    switch (selectedType) {
      case 'tesapay':
        return <SendToTesapayUser onSubmit={handleTransferSubmit} onBack={handleBack} />;
      case 'nigeria':
        return <SendToNigeriaBank onSubmit={handleTransferSubmit} onBack={handleBack} />;
      case 'international':
        return <SendToInternationalBank onSubmit={handleTransferSubmit} onBack={handleBack} />;
      default:
        return null;
    }
  };

  if (showConfirmation && transferData) {
    return (
      <TransferConfirmation 
        transferData={transferData} 
        onBack={handleBack}
        onSuccess={() => navigate('/')}
      />
    );
  }

  if (selectedType) {
    return renderTransferForm();
  }

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
      <div className="flex items-center gap-3 p-4 border-b">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Transfer Money</h1>
      </div>

      {/* Transfer Options */}
      <div className="p-4 space-y-4">
        {isFeatureEnabled('tesapay_transfer') && (
          <Card 
            className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedType('tesapay')}
          >
            <div className="text-center">
              <h3 className="text-lg font-medium">Send to Tesapay User</h3>
            </div>
          </Card>
        )}

        {isFeatureEnabled('bank_transfer') && (
          <Card 
            className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedType('nigeria')}
          >
            <div className="text-center">
              <h3 className="text-lg font-medium">Send to Nigeria Bank</h3>
            </div>
          </Card>
        )}

        {isFeatureEnabled('international_transfer') && (
          <Card 
            className="p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedType('international')}
          >
            <div className="text-center">
              <h3 className="text-lg font-medium">Send to International Bank</h3>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Transfer;