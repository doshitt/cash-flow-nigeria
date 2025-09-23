import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AirtimePurchase } from "@/components/AirtimePurchase";
import { AirtimeConfirmation } from "@/components/AirtimeConfirmation";
import { TransactionSuccess } from "@/components/TransactionSuccess";
import { TransactionReceipt } from "@/components/TransactionReceipt";
import { toast } from "@/hooks/use-toast";

type AirtimeStep = "purchase" | "confirmation" | "success" | "receipt";

interface TransactionData {
  phoneNumber: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  operator: string;
  transactionId: string;
}

export default function Airtime() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<AirtimeStep>("purchase");
  const [purchaseData, setPurchaseData] = useState<{ phoneNumber: string; amount: number } | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);

  const handlePurchaseConfirm = (data: { phoneNumber: string; amount: number }) => {
    setPurchaseData(data);
    setCurrentStep("confirmation");
  };

  const handleConfirmAndPay = async () => {
    if (!purchaseData) return;

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create transaction data
      const now = new Date();
      const transaction: TransactionData = {
        phoneNumber: purchaseData.phoneNumber,
        amount: purchaseData.amount,
        date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        status: "Successful",
        operator: "Glo", // You can determine this based on phone number prefix
        transactionId: `TX${Date.now().toString().slice(-8)}`
      };

      setTransactionData(transaction);
      setCurrentStep("success");

      toast({
        title: "Payment Successful",
        description: `Airtime of ₦${purchaseData.amount} sent to ${purchaseData.phoneNumber}`,
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (currentStep === "confirmation") {
      setCurrentStep("purchase");
    } else {
      navigate("/");
    }
  };

  const handleDone = () => {
    navigate("/");
  };

  const handleShowReceipt = () => {
    setCurrentStep("receipt");
  };

  const handleReceiptBack = () => {
    navigate("/");
  };

  switch (currentStep) {
    case "purchase":
      return <AirtimePurchase onBack={handleBack} onConfirm={handlePurchaseConfirm} />;
    
    case "confirmation":
      return (
        <AirtimeConfirmation
          onBack={handleBack}
          onConfirm={handleConfirmAndPay}
          phoneNumber={purchaseData?.phoneNumber || ""}
          amount={purchaseData?.amount || 0}
        />
      );
    
    case "success":
      return <TransactionSuccess onDone={handleDone} onShowReceipt={handleShowReceipt} />;
    
    case "receipt":
      return (
        <TransactionReceipt
          onBack={handleReceiptBack}
          transactionData={transactionData!}
        />
      );
    
    default:
      return <AirtimePurchase onBack={handleBack} onConfirm={handlePurchaseConfirm} />;
  }
}