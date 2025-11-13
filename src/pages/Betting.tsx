import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/config/api";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface BettingProvider {
  id: number;
  name: string;
  slug: string;
  groupId: number;
  skipValidation: boolean;
}

export default function Betting() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [providers, setProviders] = useState<BettingProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packages, setPackages] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchPackages(selectedProvider);
      setSelectedPackage("");
      setCustomerInfo(null);
    }
  }, [selectedProvider]);

  const fetchProviders = async () => {
    try {
      setIsLoadingProviders(true);
      const response = await fetch(`${getApiUrl('')}/coralpay/betting.php?action=providers`);
      const data = await response.json();
      
      if (data.success && data.data?.responseData) {
        setProviders(data.data.responseData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load betting providers",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load betting providers",
        variant: "destructive"
      });
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const fetchPackages = async (providerSlug: string) => {
    setIsLoadingPackages(true);
    try {
      const response = await fetch(
        `${getApiUrl('')}/coralpay/betting.php?action=packages&providerSlug=${providerSlug}`
      );
      const result = await response.json();
      
      if (result.success && result.data?.responseData) {
        setPackages(result.data.responseData);
      } else {
        setPackages([]);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      setPackages([]);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const validateCustomer = async () => {
    if (!selectedProvider || !customerId || !selectedPackage) {
      toast({
        title: "Incomplete Information",
        description: "Please select provider, package and enter customer ID",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    try {
      const provider = providers.find(p => p.slug === selectedProvider);
      
      // Skip validation for providers that skip validation
      if (provider?.skipValidation) {
        setCustomerInfo({ 
          customer: { customerName: customerId, status: 'Active' },
          validated: true 
        });
        toast({
          title: "Customer ID Accepted",
          description: "You can proceed with top-up"
        });
        setIsValidating(false);
        return;
      }

      const response = await fetch(`${getApiUrl('')}/coralpay/customer_lookup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId,
          billerSlug: selectedProvider,
          productName: selectedPackage
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const responseData = result.data;
        const customerData = responseData.customer || responseData;
        const customerName =
          customerData.customerName ||
          (customerData.firstName && customerData.lastName
            ? `${customerData.firstName} ${customerData.lastName}`
            : customerData.firstName ||
              customerData.lastName ||
              customerData.userName ||
              customerData.accountName ||
              customerData.meterNumber ||
              customerId);

        setCustomerInfo({
          customer: {
            customerName,
            ...customerData,
          },
          billerName: responseData.billerName,
          validated: true,
        });
        toast({
          title: "Customer Validated",
          description: `Customer: ${customerName}`,
        });
      } else {
        toast({
          title: "Validation Failed",
          description: result.message || result.data?.narration || "Invalid customer ID",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate customer",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleTopUp = async () => {
    if (!customerInfo || !amount) {
      toast({
        title: "Incomplete Information",
        description: "Please validate customer and enter amount",
        variant: "destructive"
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setShowPinDialog(true);
  };

  const handlePinVerify = async () => {
    if (pin.length !== 5) {
      toast({
        title: "Invalid PIN",
        description: "Please enter your 5-digit transaction PIN",
        variant: "destructive"
      });
      return;
    }

    setVerifying(true);
    
    try {
      const response = await fetch(getApiUrl('/verify_pin.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          transaction_pin: pin
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowPinDialog(false);
        await processTopUp();
      } else {
        toast({
          title: "Wrong Transaction PIN",
          description: "Wrong transaction PIN. Try again.",
          variant: "destructive"
        });
        setPin("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify PIN",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  const processTopUp = async () => {
    const amountNum = parseFloat(amount);

    setIsLoading(true);
    try {
      const authedUser = user;
      if (!authedUser?.id) {
        toast({
          title: "Auth Error",
          description: "Please log in again",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`${getApiUrl('')}/coralpay/vend.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: authedUser.id,
          customerId: customerId,
          billerSlug: selectedProvider,
          amount: amountNum,
          customerName: customerInfo.customer?.customerName || `${authedUser.first_name} ${authedUser.last_name}`,
          phoneNumber: authedUser.phone,
          email: authedUser.email,
          billerType: 'betting'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Betting account topped up successfully!`,
        });
        
        // Reset form
        setCustomerId("");
        setAmount("");
        setSelectedProvider("");
        setCustomerInfo(null);
      } else {
        toast({
          title: "Transaction Failed",
          description: data.message || "Failed to process top-up",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing top-up:', error);
      toast({
        title: "Error",
        description: "Failed to process transaction",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setPin("");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Betting Top-Up</h1>
            <p className="text-sm text-muted-foreground">Fund your betting account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Betting Account Top-Up</CardTitle>
                <CardDescription>
                  Fund your betting account instantly
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Top up your betting account with popular providers including Bet9ja, MLotto, and more.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider">Betting Provider</Label>
                {isLoadingProviders ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : providers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground border rounded-md bg-muted">
                    No betting providers available at the moment
                  </div>
                ) : (
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger id="provider" className="bg-background">
                      <SelectValue placeholder="Select betting provider" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.slug}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="package">Select Package</Label>
                {isLoadingPackages ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : packages.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground border rounded-md bg-muted">
                    {selectedProvider ? "No packages available for this provider" : "Select a provider first"}
                  </div>
                ) : (
                  <Select value={selectedPackage} onValueChange={setSelectedPackage} disabled={!selectedProvider}>
                    <SelectTrigger id="package" className="bg-background">
                      <SelectValue placeholder="Select betting package" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-background border shadow-lg">
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.slug} value={pkg.slug}>
                          {pkg.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerId">Customer ID / Username</Label>
                <Input
                  id="customerId"
                  placeholder="Enter your betting account ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={!selectedPackage}
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={validateCustomer}
                disabled={isValidating || !selectedProvider || !selectedPackage || !customerId}
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Customer"
                )}
              </Button>

              {customerInfo && (
                <Card className="p-4 bg-muted">
                  <p className="text-sm"><strong>Customer:</strong> {customerInfo.customer?.customerName || 'Validated'}</p>
                  <p className="text-sm"><strong>Status:</strong> {customerInfo.customer?.status || 'Active'}</p>
                </Card>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="100"
                  disabled={!customerInfo}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum amount: ₦100
                </p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleTopUp}
                disabled={isLoading || !customerInfo || !amount}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Top Up Account"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PIN Verification Dialog */}
      <AlertDialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Transaction PIN</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter your 5-digit transaction PIN to confirm this betting top-up
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP
              maxLength={5}
              value={pin}
              onChange={(value) => setPin(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowPinDialog(false);
              setPin("");
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePinVerify} disabled={verifying || pin.length !== 5}>
              {verifying ? "Verifying..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
