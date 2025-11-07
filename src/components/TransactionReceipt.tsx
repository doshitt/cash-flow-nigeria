import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, CheckCircle, Share2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface TransactionData {
  phoneNumber?: string;
  amount: number;
  date: string;
  time?: string;
  status: string;
  operator?: string;
  transactionId: string;
  type?: string;
  recipient?: string;
  customerId?: string;
  token?: string;
  packageName?: string;
}

interface TransactionReceiptProps {
  transactionData: TransactionData;
  onBack?: () => void;
}

export default function TransactionReceipt({
  transactionData,
  onBack
}: TransactionReceiptProps) {
  const {
    transactionId,
    amount,
    type = 'airtime',
    status,
    date,
    time,
    phoneNumber,
    operator,
    recipient,
    customerId,
    token,
    packageName
  } = transactionData;
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`TesaPay_Receipt_${transactionId}.pdf`);

      toast({
        title: "Success",
        description: "Receipt downloaded successfully"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive"
      });
    }
  };

  const shareReceipt = async () => {
    const shareData = {
      title: 'TesaPay Receipt',
      text: `Transaction ${transactionId}\nAmount: ₦${amount}\nType: ${type}\nStatus: ${status}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(
          `TesaPay Transaction Receipt\n\nTransaction ID: ${transactionId}\nAmount: ₦${amount}\nType: ${type}\nStatus: ${status}\nDate: ${date}`
        );
        toast({
          title: "Copied",
          description: "Receipt details copied to clipboard"
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Card ref={receiptRef} className="bg-white">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Transaction Successful</CardTitle>
          <p className="text-muted-foreground">Your transaction was completed successfully</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="text-center pb-6 border-b">
            <p className="text-sm text-muted-foreground mb-1">Amount</p>
            <p className="text-4xl font-bold text-green-600">₦{amount.toLocaleString()}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-sm">{transactionId}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{type}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize text-green-600">{status}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Date & Time</span>
              <span>{time ? `${date} ${time}` : new Date(date).toLocaleString()}</span>
            </div>

            {phoneNumber && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Phone Number</span>
                <span className="font-medium">{phoneNumber}</span>
              </div>
            )}

            {operator && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Operator</span>
                <span className="font-medium">{operator}</span>
              </div>
            )}

            {recipient && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium">{recipient}</span>
              </div>
            )}

            {customerId && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Customer ID</span>
                <span className="font-mono text-sm">{customerId}</span>
              </div>
            )}

            {packageName && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{packageName}</span>
              </div>
            )}

            {token && (
              <div className="py-2 border-b">
                <p className="text-muted-foreground mb-2">Token</p>
                <p className="font-mono text-sm bg-gray-100 p-3 rounded break-all">{token}</p>
              </div>
            )}
          </div>

          <div className="pt-4 text-center text-xs text-muted-foreground">
            <p>Thank you for using TesaPay</p>
            <p className="mt-1">For support, contact: support@tesapay.com</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {onBack && (
          <Button onClick={onBack} variant="outline" className="flex-1">
            Back to Home
          </Button>
        )}
        <Button onClick={downloadPDF} className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        <Button onClick={shareReceipt} variant="outline" className="flex-1">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  );
}
