import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";

export default function Electricity() {
  const navigate = useNavigate();
  const [meterNumber, setMeterNumber] = useState("");
  const [selectedDisco, setSelectedDisco] = useState("");
  const [meterType, setMeterType] = useState("");
  const [amount, setAmount] = useState("");
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const discos = [
    { value: "IKEDC", label: "Ikeja Electric (IKEDC)", prepaid: "IKEDC_PREPAID", postpaid: "IKEDC_POSTPAID" },
    { value: "EKEDC", label: "Eko Electric (EKEDC)", prepaid: "EKEDC_PREPAID", postpaid: "EKEDC_POSTPAID" },
    { value: "AEDC", label: "Abuja Electric (AEDC)", prepaid: "AEDC_PREPAID", postpaid: "AEDC_POSTPAID" },
    { value: "PHEDC", label: "Port Harcourt Electric (PHEDC)", prepaid: "PHEDC_PREPAID", postpaid: "PHEDC_POSTPAID" },
    { value: "IBEDC", label: "Ibadan Electric (IBEDC)", prepaid: "IBEDC_PREPAID", postpaid: "IBEDC_POSTPAID" },
    { value: "KEDC", label: "Kaduna Electric (KEDC)", prepaid: "KEDC_PREPAID", postpaid: "KEDC_POSTPAID" },
    { value: "JEDC", label: "Jos Electric (JEDC)", prepaid: "JEDC_PREPAID", postpaid: "JEDC_POSTPAID" }
  ];

  const validateMeter = async () => {
    if (!meterNumber || !selectedDisco || !meterType) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const disco = discos.find(d => d.value === selectedDisco);
      const productName = meterType === 'prepaid' ? disco?.prepaid : disco?.postpaid;

      const response = await fetch(`${getApiUrl('')}/coralpay/customer_lookup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: meterNumber,
          billerSlug: selectedDisco,
          productName: productName
        })
      });

      const result = await response.json();

      if (result.success) {
        setCustomerInfo(result.data);
        toast({
          title: "Meter Validated",
          description: `Customer: ${result.data.customer?.customerName || 'Unknown'}`
        });
      } else {
        toast({
          title: "Validation Failed",
          description: result.message || "Invalid meter number",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate meter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!customerInfo || !amount) {
      toast({
        title: "Error",
        description: "Please validate meter and enter amount",
        variant: "destructive"
      });
      return;
    }

    const amountValue = parseFloat(amount);
    const minAmount = customerInfo.minPayableAmount || 500;

    if (amountValue < minAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum amount is ₦${minAmount}`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('tesapay_user') || '{}');
      const disco = discos.find(d => d.value === selectedDisco);
      const packageSlug = meterType === 'prepaid' ? disco?.prepaid : disco?.postpaid;

      const response = await fetch(`${getApiUrl('')}/coralpay/vend.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customerId: meterNumber,
          packageSlug: packageSlug,
          billerSlug: selectedDisco,
          amount: amountValue,
          customerName: customerInfo.customer?.customerName,
          phoneNumber: user.phone,
          email: user.email,
          billerType: 'electricity'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Payment Successful!",
          description: result.data.token ? `Token: ${result.data.token}` : "Electricity credited successfully"
        });
        navigate('/');
      } else {
        toast({
          title: "Payment Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Electricity Bill</h1>
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
            <label className="text-sm font-medium">Select Distribution Company</label>
            <Select value={selectedDisco} onValueChange={setSelectedDisco}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your DISCO" />
              </SelectTrigger>
              <SelectContent>
                {discos.map(disco => (
                  <SelectItem key={disco.value} value={disco.value}>
                    {disco.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Meter Type</label>
            <Select value={meterType} onValueChange={setMeterType}>
              <SelectTrigger>
                <SelectValue placeholder="Select meter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prepaid">Prepaid</SelectItem>
                <SelectItem value="postpaid">Postpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Meter Number</label>
            <Input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              placeholder="Enter meter number"
            />
          </div>

          <Button
            onClick={validateMeter}
            disabled={loading || !meterNumber || !selectedDisco || !meterType}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Validating...' : 'Validate Meter'}
          </Button>

          {customerInfo && (
            <Card className="p-4 bg-muted">
              <p className="text-sm"><strong>Customer:</strong> {customerInfo.customer?.customerName}</p>
              <p className="text-sm"><strong>Address:</strong> {customerInfo.customer?.address}</p>
              {customerInfo.arrearsBalance > 0 && (
                <p className="text-sm text-destructive">
                  <strong>Arrears:</strong> ₦{customerInfo.arrearsBalance?.toLocaleString()}
                </p>
              )}
              <p className="text-sm"><strong>Min Amount:</strong> ₦{customerInfo.minPayableAmount?.toLocaleString()}</p>
            </Card>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (₦)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              disabled={!customerInfo}
            />
          </div>

          <Button
            onClick={handlePayment}
            disabled={loading || !customerInfo || !amount}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
