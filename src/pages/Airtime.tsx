import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AirtimePurchase } from "@/components/AirtimePurchase";
import { AirtimeConfirmation } from "@/components/AirtimeConfirmation";
import { TransactionSuccess } from "@/components/TransactionSuccess";
import { TransactionReceipt } from "@/components/TransactionReceipt";
import { toast } from "@/hooks/use-toast";
import { useFeatures } from "@/hooks/useFeatures";

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
  const { isFeatureEnabled } = useFeatures();
  const [currentStep, setCurrentStep] = useState<AirtimeStep>("purchase");
  const [purchaseData, setPurchaseData] = useState<{ phoneNumber: string; amount: number } | null>(null);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);

  // Redirect if feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled('airtime')) {
      navigate('/');
    }
  }, [isFeatureEnabled, navigate]);

  const handlePurchaseConfirm = (data: { phoneNumber: string; amount: number }) => {
    setPurchaseData(data);
    setCurrentStep("confirmation");
  };

  const handleConfirmAndPay = async () => {
    if (!purchaseData) return;

    try {
      const user = JSON.parse(localStorage.getItem('tesapay_user') || '{}');
      
      // Determine network from phone prefix
      const phonePrefix = purchaseData.phoneNumber.substring(0, 4);
      let networkSlug = 'MTN-VTU';
      if (phonePrefix.startsWith('070') || phonePrefix.startsWith('080') || phonePrefix.startsWith('090')) {
        networkSlug = 'GLO-VTU';
      } else if (phonePrefix.startsWith('080') || phonePrefix.startsWith('081')) {
        networkSlug = 'AIRTEL-VTU';
      } else if (phonePrefix.startsWith('080') || phonePrefix.startsWith('081')) {
        networkSlug = '9MOBILE-VTU';
      }

      const response = await fetch(`${window.location.origin}/backend/coralpay/vend.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customerId: purchaseData.phoneNumber,
          packageSlug: networkSlug,
          amount: purchaseData.amount,
          customerName: `${user.first_name} ${user.last_name}`,
          phoneNumber: user.phone,
          email: user.email,
          billerType: 'airtime'
        })
      });

      const result = await response.json();

      if (result.success) {
        const now = new Date();
        const transaction: TransactionData = {
          phoneNumber: purchaseData.phoneNumber,
          amount: purchaseData.amount,
          date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          status: "Successful",
          operator: networkSlug.replace('-VTU', ''),
          transactionId: result.data.transaction_id
        };

        setTransactionData(transaction);
        setCurrentStep("success");

        toast({
          title: "Payment Successful",
          description: `Airtime of ₦${purchaseData.amount} sent to ${purchaseData.phoneNumber}`,
        });
      } else {
        toast({
          title: "Payment Failed",
          description: result.message || "Please try again",
          variant: "destructive",
        });
      }
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