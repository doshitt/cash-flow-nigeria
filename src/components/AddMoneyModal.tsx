import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, RefreshCw, CreditCard, Bitcoin } from "lucide-react";
import { BankTransferScreen } from "./BankTransferScreen";
import { ConversionScreen } from "./ConversionScreen";
import { CardPaymentScreen } from "./CardPaymentScreen";
import { CryptoPaymentScreen } from "./CryptoPaymentScreen";

interface AddMoneyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCurrency: string;
}

type Screen = "main" | "bank-transfer" | "conversion" | "card" | "crypto";

export const AddMoneyModal = ({ open, onOpenChange, selectedCurrency }: AddMoneyModalProps) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");

  const handleBack = () => {
    setCurrentScreen("main");
  };

  const handleClose = () => {
    setCurrentScreen("main");
    onOpenChange(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "bank-transfer":
        return <BankTransferScreen onBack={handleBack} />;
      case "conversion":
        return <ConversionScreen onBack={handleBack} selectedCurrency={selectedCurrency} />;
      case "card":
        return <CardPaymentScreen onBack={handleBack} selectedCurrency={selectedCurrency} />;
      case "crypto":
        return <CryptoPaymentScreen onBack={handleBack} />;
      default:
        return (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Top up {selectedCurrency}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-full h-auto p-4 flex items-start gap-3 hover:bg-accent"
                onClick={() => setCurrentScreen("bank-transfer")}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Add via bank transfer</h3>
                  <p className="text-sm text-muted-foreground">
                    Fund your account by sending money to your unique NG bank account
                  </p>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full h-auto p-4 flex items-start gap-3 hover:bg-accent"
                onClick={() => setCurrentScreen("conversion")}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Add via conversion</h3>
                  <p className="text-sm text-muted-foreground">
                    Convert funds from another balance to your {selectedCurrency} balance
                  </p>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full h-auto p-4 flex items-start gap-3 hover:bg-accent"
                onClick={() => setCurrentScreen("card")}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Add via bank card</h3>
                  <p className="text-sm text-muted-foreground">
                    Top up your account using your debit or credit card
                  </p>
                </div>
              </Button>

              <Button
                variant="ghost"
                className="w-full h-auto p-4 flex items-start gap-3 hover:bg-accent"
                onClick={() => setCurrentScreen("crypto")}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium">Add via crypto</h3>
                  <p className="text-sm text-muted-foreground">
                    Send USDT to your wallet address and get USD instantly
                  </p>
                </div>
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {currentScreen !== "main" && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        {renderScreen()}
      </DialogContent>
    </Dialog>
  );
};