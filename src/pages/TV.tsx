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

interface TVPackage {
  id: number;
  name: string;
  slug: string;
  amount: number | null;
  billerId: number;
}

interface TVProvider {
  id: number;
  name: string;
  slug: string;
  groupId: number;
}

export default function TV() {
  const navigate = useNavigate();
  const [smartcardNumber, setSmartcardNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packages, setPackages] = useState<TVPackage[]>([]);
  const [providers, setProviders] = useState<TVProvider[]>([]);
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetchTVPackages(selectedProvider);
    }
  }, [selectedProvider]);

  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const response = await fetch(`${getApiUrl('')}/coralpay/tv.php?action=providers`);
      const result = await response.json();
      
      if (result.success && result.data?.responseData) {
        setProviders(result.data.responseData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load TV providers",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load TV providers",
        variant: "destructive"
      });
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchTVPackages = async (billerSlug: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiUrl('')}/coralpay/tv.php?action=packages&providerSlug=${billerSlug}`
      );
      const result = await response.json();
      
      if (result.success && result.data?.responseData) {
        setPackages(result.data.responseData);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load TV packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateSmartcard = async () => {
    if (!smartcardNumber || !selectedProvider || !selectedPackage) {
      toast({
        title: "Validation Error",
        description: "Please enter smartcard number, select provider and package",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl('')}/coralpay/customer_lookup.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: smartcardNumber,
          billerSlug: selectedProvider,
          productName: selectedPackage // Required for TV validation
        })
      });

      const result = await response.json();

      if (result.success) {
        setCustomerInfo(result.data);
        toast({
          title: "Smartcard Validated",
          description: `Customer: ${result.data.customer?.customerName || 'Unknown'}`
        });
      } else {
        toast({
          title: "Validation Failed",
          description: result.message || "Invalid smartcard number",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate smartcard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!customerInfo || !selectedPackage) {
      toast({
        title: "Error",
        description: "Please validate smartcard and select package",
        variant: "destructive"
      });
      return;
    }

    const selectedPkg = packages.find(p => p.slug === selectedPackage);
    if (!selectedPkg) return;

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('tesapay_user') || '{}');

      const response = await fetch(`${getApiUrl('')}/coralpay/vend.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          customerId: smartcardNumber,
          packageSlug: selectedPackage,
          billerSlug: selectedProvider,
          amount: selectedPkg.amount,
          customerName: customerInfo.customer?.customerName,
          phoneNumber: user.phone,
          email: user.email,
          billerType: 'tv'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Subscription Successful!",
          description: `${selectedPkg.name} subscription activated for ${smartcardNumber}`
        });
        navigate('/');
      } else {
        toast({
          title: "Subscription Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process subscription",
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
        <h1 className="text-lg font-semibold">TV Subscription</h1>
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
            <label className="text-sm font-medium">Select Provider</label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider} disabled={loadingProviders}>
              <SelectTrigger>
                <SelectValue placeholder={loadingProviders ? "Loading providers..." : "Choose TV provider"} />
              </SelectTrigger>
              <SelectContent>
                {providers.map(provider => (
                  <SelectItem key={provider.slug} value={provider.slug}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Smartcard Number</label>
            <Input
              type="text"
              value={smartcardNumber}
              onChange={(e) => setSmartcardNumber(e.target.value)}
              placeholder="Enter smartcard number"
            />
          </div>

          <Button
            onClick={validateSmartcard}
            disabled={loading || !smartcardNumber || !selectedProvider}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Validating...' : 'Validate Smartcard'}
          </Button>

          {customerInfo && (
            <Card className="p-4 bg-muted">
              <p className="text-sm"><strong>Customer:</strong> {customerInfo.customer?.customerName}</p>
              <p className="text-sm"><strong>Status:</strong> {customerInfo.customer?.status || 'Active'}</p>
            </Card>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Package</label>
            <Select 
              value={selectedPackage} 
              onValueChange={setSelectedPackage}
              disabled={!customerInfo || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading packages..." : "Choose subscription package"} />
              </SelectTrigger>
              <SelectContent>
                {packages.filter(pkg => pkg.amount !== null).map(pkg => (
                  <SelectItem key={pkg.slug} value={pkg.slug}>
                    {pkg.name} - ₦{pkg.amount?.toLocaleString() || 'N/A'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading || !customerInfo || !selectedPackage}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
