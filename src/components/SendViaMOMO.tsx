import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TransferData } from "@/pages/Transfer";

interface SendViaMOMOProps {
  onSubmit: (data: TransferData) => void;
  onBack: () => void;
}

export const SendViaMOMO = ({ onSubmit, onBack }: SendViaMOMOProps) => {
  const [showWarning, setShowWarning] = useState(true);
  const [formData, setFormData] = useState({
    momoNumber: '',
    momoName: '',
    amount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: 'momo',
      amount: parseFloat(formData.amount),
      currency: 'GHS',
      recipientInfo: {
        momoNumber: formData.momoNumber,
        momoName: formData.momoName
      },
      description: `MOMO transfer to ${formData.momoName}`
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ Important Notice</AlertDialogTitle>
            <AlertDialogDescription>
              Every MOMO transaction is non-reversible. Please ensure your MOMO details are correct before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarning(false)}>
              OK, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Send via MOMO</h1>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="momoNumber">MOMO Number</Label>
              <Input
                id="momoNumber"
                type="tel"
                placeholder="e.g. 0244123456"
                value={formData.momoNumber}
                onChange={(e) => setFormData({ ...formData, momoNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="momoName">Name on MOMO Number</Label>
              <Input
                id="momoName"
                type="text"
                placeholder="Enter recipient name"
                value={formData.momoName}
                onChange={(e) => setFormData({ ...formData, momoName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (GHS)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-8"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This will be deducted from your Ghana Cedis wallet
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={!formData.momoNumber || !formData.momoName || !formData.amount}
            >
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};