import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ExchangeRateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const exchangeRates = [
  { 
    currency: "GBP", 
    flag: "🇬🇧", 
    selling: "GBP", 
    buying: "GBP" 
  },
  { 
    currency: "USD", 
    flag: "🇺🇸", 
    selling: "GBP", 
    buying: "GBP" 
  },
  { 
    currency: "EUR", 
    flag: "🇪🇺", 
    selling: "GBP", 
    buying: "GBP" 
  }
];

export const ExchangeRateModal = ({ open, onOpenChange }: ExchangeRateModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold text-destructive">
            Ex Rate Exchange
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center gap-8 mb-6">
            <span className="font-medium">Selling</span>
            <span className="font-medium">Buying</span>
          </div>
          
          <div className="space-y-4">
            {exchangeRates.map((rate, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{rate.flag}</span>
                  <span className="font-medium">{rate.currency}</span>
                </div>
                <div className="flex justify-center gap-8 flex-1">
                  <span className="text-sm">{rate.selling}</span>
                  <span className="text-sm">{rate.buying}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <div className="w-32 h-1 bg-foreground rounded-full"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
};