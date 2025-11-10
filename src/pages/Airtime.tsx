import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TransactionReceipt from "@/components/TransactionReceipt";
import { TransactionSuccess } from "@/components/TransactionSuccess";
import { toast } from "@/hooks/use-toast";
import { useFeatures } from "@/hooks/useFeatures";
import { getApiUrl } from "@/config/api";
import { useAuth } from "@/hooks/useAuth";

interface AirtimePackage {
  id: number;
  name: string;
  slug: string;
  amount: number;
  billerId: number;
}

interface NetworkBiller {
  id: number;
  name: string;
  slug: string;
  groupId: number;
}

interface TransactionData {
  phoneNumber: string;
  amount: number;
  date: string;
  time: string;
  status: string;
  operator: string;
  transactionId: string;
}

type AirtimeStep = "purchase" | "success" | "receipt";

export default function Airtime() {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatures();
  const { user, checkSession } = useAuth();
  const [currentStep, setCurrentStep] = useState<AirtimeStep>("purchase");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [amount, setAmount] = useState("");
  const [packages, setPackages] = useState<AirtimePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [networks, setNetworks] = useState<NetworkBiller[]>([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  const [selectedPackageSlug, setSelectedPackageSlug] = useState("");

  const predefinedAmounts = [100, 200, 500, 1000, 2000, 5000];

  // Default networks as fallback
  const defaultNetworks: NetworkBiller[] = [
    { id: 1, name: "MTN", slug: "MTN-VTU", groupId: 1 },
    { id: 2, name: "Airtel", slug: "AIRTEL-VTU", groupId: 1 },
    { id: 3, name: "Glo", slug: "GLO-VTU", groupId: 1 },
    { id: 4, name: "9Mobile", slug: "9MOBILE-VTU", groupId: 1 }
  ];

  useEffect(() => {
    if (!isFeatureEnabled('airtime')) {
      navigate('/');
    }
    fetchNetworks();
  }, [isFeatureEnabled, navigate]);

  const fetchNetworks = async () => {
    setLoadingNetworks(true);
    try {
      const response = await fetch(
        `${getApiUrl('')}/coralpay/billers.php?action=billers&groupSlug=airtime_and_data`
      );
      const result = await response.json();
      
      if (result.success && result.data?.responseData) {
        setNetworks(result.data.responseData);
        toast({
          title: "Networks Loaded",
          description: "Successfully loaded from CoralPay API",
        });
      } else {
        // Use defaults if API fails
        setNetworks(defaultNetworks);
        console.warn('CoralPay API error:', result.error || result.message);
      }
    } catch (error) {
      console.error('Error fetching networks:', error);
      // Use defaults if fetch fails
      setNetworks(defaultNetworks);
    } finally {
      setLoadingNetworks(false);
    }
  };

  useEffect(() => {
    if (selectedNetwork) {
      fetchAirtimePackages(selectedNetwork);
    }
  }, [selectedNetwork]);

  const fetchAirtimePackages = async (billerSlug: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiUrl('')}/coralpay/billers.php?action=packages&billerSlug=${billerSlug}`
      );
      const result = await response.json();
      
      if (result.success && result.data?.responseData) {
        const fetchedPackages = result.data.responseData;
        setPackages(fetchedPackages);
        
        // Find VTU package (Variable Top Up) - this is what allows custom amounts
        const vtuPackage = fetchedPackages.find((p: AirtimePackage) => 
          p.name.toUpperCase().includes('VTU') || p.slug.toUpperCase().includes('VTU')
        );
        
        if (vtuPackage) {
          setSelectedPackageSlug(vtuPackage.slug);
          console.log('Using VTU package:', vtuPackage.slug);
        } else if (fetchedPackages.length > 0) {
          // Fallback to first package if no VTU found
          setSelectedPackageSlug(fetchedPackages[0].slug);
          console.log('Using first package:', fetchedPackages[0].slug);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!phoneNumber || !selectedNetwork || !amount) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseInt(amount);
    if (amountValue < 100) {
      toast({
        title: "Validation Error",
        description: "Minimum amount is ₦100",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in again",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Use the VTU package slug that was fetched when network was selected
      if (!selectedPackageSlug) {
        toast({
          title: "Error",
          description: "Please wait for packages to load",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${getApiUrl('')}/coralpay/vend.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customerId: phoneNumber,
          packageSlug: selectedPackageSlug,
          amount: amountValue,
          customerName: `${user.first_name} ${user.last_name}`,
          phoneNumber: user.phone,
          email: user.email,
          billerType: 'airtime'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh balance immediately
        await checkSession();
        
        const now = new Date();
        const transaction: TransactionData = {
          phoneNumber: phoneNumber,
          amount: amountValue,
          date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          status: "Successful",
          operator: networks.find(n => n.slug === selectedNetwork)?.name || selectedNetwork,
          transactionId: result.data.transaction_id
        };

        setTransactionData(transaction);
        setCurrentStep("success");

        toast({
          title: "Payment Successful",
          description: `Airtime of ₦${amountValue} sent to ${phoneNumber}`,
        });
      } else {
        toast({
          title: "Transaction Failed",
          description: result.message || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
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

  if (currentStep === "success") {
    return <TransactionSuccess onDone={handleDone} onShowReceipt={handleShowReceipt} />;
  }

  if (currentStep === "receipt" && transactionData) {
    return (
      <TransactionReceipt
        onBack={handleReceiptBack}
        transactionData={transactionData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Buy Airtime</h1>
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-destructive" />
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-avatar.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Network</label>
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork} disabled={loadingNetworks}>
              <SelectTrigger>
                <SelectValue placeholder={loadingNetworks ? "Loading networks..." : "Choose network provider"} />
              </SelectTrigger>
              <SelectContent>
                {networks.map(network => (
                  <SelectItem key={network.slug} value={network.slug}>
                    {network.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="081xxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (min ₦100)"
            />
          </div>

          <Button
            onClick={handlePurchase}
            disabled={!phoneNumber || !selectedNetwork || !amount || loading}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? 'Processing...' : 'Buy Airtime'}
          </Button>
        </Card>

        {/* Quick Amount Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Select Amount</label>
          <div className="grid grid-cols-3 gap-2">
            {predefinedAmounts.map((amt) => (
              <Button
                key={amt}
                variant="outline"
                onClick={() => handleAmountSelect(amt)}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                ₦{amt.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}