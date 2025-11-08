import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useFeatures } from "@/hooks/useFeatures";
import { API_CONFIG, getApiUrl } from "@/config/api";

interface DataPackage {
  id: number;
  name: string;
  slug: string;
  amount: number;
  billerId: number;
}

interface NetworkProvider {
  id: number;
  name: string;
  slug: string;
  groupId: number;
}

export default function Data() {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatures();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [packages, setPackages] = useState<DataPackage[]>([]);
  const [networks, setNetworks] = useState<NetworkProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    if (!isFeatureEnabled('data')) {
      navigate('/');
    }
  }, [isFeatureEnabled, navigate]);

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    if (selectedNetwork) {
      fetchDataPackages(selectedNetwork);
    }
  }, [selectedNetwork]);

  const fetchProviders = async () => {
    setLoadingProviders(true);
    try {
      const response = await fetch(`${getApiUrl('')}/coralpay/data.php?action=providers`);
      const result = await response.json();
      
      if (result.success && result.data?.responseData) {
        setNetworks(result.data.responseData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load data providers",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load data providers",
        variant: "destructive"
      });
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchDataPackages = async (billerSlug: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${getApiUrl('')}/coralpay/data.php?action=packages&providerSlug=${billerSlug}`
      );
      const result = await response.json();
      
      if (result.success && result.data?.responseData) {
        setPackages(result.data.responseData);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load data packages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!phoneNumber || !selectedNetwork || !selectedPackage) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
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
          customerId: phoneNumber,
          packageSlug: selectedPackage,
          billerSlug: selectedNetwork,
          amount: selectedPkg.amount,
          customerName: `${user.first_name} ${user.last_name}`,
          phoneNumber: user.phone,
          email: user.email,
          billerType: 'data'
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success!",
          description: `Data bundle purchased successfully for ${phoneNumber}`
        });
        navigate('/');
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

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Buy Data</h1>
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
            <Select value={selectedNetwork} onValueChange={setSelectedNetwork} disabled={loadingProviders}>
              <SelectTrigger>
                <SelectValue placeholder={loadingProviders ? "Loading networks..." : "Choose network provider"} />
              </SelectTrigger>
              <SelectContent className="z-50">
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
            <label className="text-sm font-medium">Select Data Package</label>
            <Select 
              value={selectedPackage} 
              onValueChange={setSelectedPackage}
              disabled={!selectedNetwork || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading packages..." : "Choose data bundle"} />
              </SelectTrigger>
              <SelectContent className="z-50">
                {packages.length === 0 && !loading && (
                  <SelectItem value="-" disabled>No packages available</SelectItem>
                )}
                {packages.map(pkg => (
                  <SelectItem key={pkg.slug} value={pkg.slug}>
                    {pkg.name} - ₦{pkg.amount.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={!phoneNumber || !selectedNetwork || !selectedPackage || loading}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {loading ? 'Processing...' : 'Buy Data'}
          </Button>
        </Card>
      </div>
    </div>
  );
}
