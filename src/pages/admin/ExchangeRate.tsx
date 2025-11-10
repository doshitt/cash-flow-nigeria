import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, RefreshCw, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getAdminApiUrl } from "@/config/admin-api";

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  fee_percentage: number;
  status: string;
  updated_at: string;
}

const currencies = [
  { code: "NGN", flag: "🇳🇬", name: "Nigerian Naira" },
  { code: "USD", flag: "🇺🇸", name: "US Dollar" },
  { code: "GBP", flag: "🇬🇧", name: "British Pound" },
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "GHS", flag: "🇬🇭", name: "Ghana Cedis" }
];

export default function ExchangeRate() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [cryptoFees, setCryptoFees] = useState<any[]>([]);
  const [cryptoPlatformFees, setCryptoPlatformFees] = useState<any[]>([]);
  const [momoFees, setMomoFees] = useState<any[]>([]);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [formData, setFormData] = useState({
    from_currency: 'NGN',
    to_currency: 'USD',
    rate: '',
    fee_percentage: '0.5'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRates();
    fetchTransferFees();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch(getAdminApiUrl('/exchange_rates.php'));
      const data = await response.json();
      if (data.success) {
        setRates(data.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load exchange rates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGoogleRates = async () => {
    setSyncing(true);
    try {
      // Using exchangerate-api.com free tier - fetches NGN rates
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/NGN');
      const data = await response.json();
      
      if (data.rates) {
        const currencyPairs = [
          { from: 'NGN', to: 'USD', rate: data.rates.USD },
          { from: 'NGN', to: 'GBP', rate: data.rates.GBP },
          { from: 'NGN', to: 'EUR', rate: data.rates.EUR },
          { from: 'NGN', to: 'GHS', rate: data.rates.GHS },
          { from: 'USD', to: 'NGN', rate: 1 / data.rates.USD },
          { from: 'GBP', to: 'NGN', rate: 1 / data.rates.GBP },
          { from: 'EUR', to: 'NGN', rate: 1 / data.rates.EUR },
          { from: 'GHS', to: 'NGN', rate: 1 / data.rates.GHS },
        ];

        // Update all rates in database
        for (const pair of currencyPairs) {
          const feePercentage = pair.to === 'NGN' ? '0.5' : '0';
          await fetch(getAdminApiUrl('/exchange_rates.php'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from_currency: pair.from,
              to_currency: pair.to,
              rate: pair.rate.toFixed(6),
              fee_percentage: feePercentage
            })
          });
        }

        toast({
          title: "Success",
          description: "Exchange rates synced from Google"
        });
        fetchRates();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync rates",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const fetchTransferFees = async () => {
    try {
      const response = await fetch(getAdminApiUrl('/transfer_fees.php?type=all'));
      const data = await response.json();
      if (data.success) {
        setCryptoFees(data.crypto_fees || []);
        setCryptoPlatformFees(data.crypto_platform_fees || []);
        setMomoFees(data.momo_fees || []);
      }
    } catch (error) {
      console.error('Failed to load transfer fees:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(getAdminApiUrl('/exchange_rates.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Exchange rate updated successfully"
        });
        fetchRates();
        setIsDialogOpen(false);
        setFormData({
          from_currency: 'NGN',
          to_currency: 'USD',
          rate: '',
          fee_percentage: '0.5'
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exchange rate",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTransferFee = async (feeData: any, type: string) => {
    try {
      const response = await fetch(getAdminApiUrl('/transfer_fees.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...feeData, fee_type: type })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Transfer fees updated successfully"
        });
        fetchTransferFees();
        setEditingFee(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transfer fees",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exchange Rates & Transfer Fees</h1>
          <p className="text-muted-foreground">Manage currency exchange rates, crypto fees, and MOMO fees</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Manual Update</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Exchange Rates</DialogTitle>
                <DialogDescription>
                  Manually update currency exchange rates
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">From</Label>
                  <Select value={formData.from_currency} onValueChange={(value) => setFormData({...formData, from_currency: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">To</Label>
                  <Select value={formData.to_currency} onValueChange={(value) => setFormData({...formData, to_currency: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Rate</Label>
                  <Input 
                    placeholder="1.00" 
                    className="col-span-3"
                    value={formData.rate}
                    onChange={(e) => setFormData({...formData, rate: e.target.value})}
                    type="number"
                    step="0.01"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Fee %</Label>
                  <Input 
                    placeholder="0" 
                    className="col-span-3"
                    value={formData.fee_percentage}
                    onChange={(e) => setFormData({...formData, fee_percentage: e.target.value})}
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rate Mode</CardTitle>
          <CardDescription>Choose between automatic Google rates or manual rate entry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-mode">Automatic Rate Sync</Label>
              <p className="text-sm text-muted-foreground">
                {isAutoMode ? "Using live Google exchange rates" : "Using manually configured rates"}
              </p>
            </div>
            <Switch 
              id="auto-mode"
              checked={isAutoMode} 
              onCheckedChange={setIsAutoMode}
            />
          </div>
          {isAutoMode && (
            <div className="mt-4">
              <Button 
                onClick={fetchGoogleRates}
                disabled={syncing}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Rates Now'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Automatically fetches latest exchange rates and applies 0.5% fee for conversions to NGN
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Currencies</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Supported currencies</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2.4M</div>
            <p className="text-xs text-muted-foreground">Exchange volume today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2:30 PM</div>
            <p className="text-xs text-muted-foreground">Rates synchronized</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="exchange-rates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="exchange-rates">Exchange Rates</TabsTrigger>
          <TabsTrigger value="crypto-fees">Crypto Fees</TabsTrigger>
          <TabsTrigger value="momo-fees">MOMO Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="exchange-rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Exchange Rates</CardTitle>
              <CardDescription>Manage conversion rates for all supported currencies</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading...</p>
              ) : rates.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No exchange rates configured yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => {
                      const fromCurrency = currencies.find(c => c.code === rate.from_currency);
                      const toCurrency = currencies.find(c => c.code === rate.to_currency);
                      
                      return (
                        <TableRow key={rate.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{fromCurrency?.flag}</span>
                              <span className="font-medium">{rate.from_currency}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{toCurrency?.flag}</span>
                              <span className="font-medium">{rate.to_currency}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{rate.rate}</TableCell>
                          <TableCell>{rate.fee_percentage}%</TableCell>
                          <TableCell>
                            <span className={rate.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                              {rate.status}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(rate.updated_at).toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto-fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crypto Platform Fees (Tiered)</CardTitle>
              <CardDescription>Platform fees charged based on transaction amount</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount Range</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Fee Value</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cryptoPlatformFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        ${fee.min_amount} - {fee.max_amount ? `$${fee.max_amount}` : 'Upward'}
                      </TableCell>
                      <TableCell className="capitalize">{fee.fee_type}</TableCell>
                      <TableCell>
                        {fee.fee_type === 'percentage' ? `${fee.fee_value}%` : `$${fee.fee_value}`}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newValue = prompt(`Enter new ${fee.fee_type} value:`, fee.fee_value);
                            if (newValue) {
                              handleUpdateTransferFee({
                                id: fee.id,
                                fee_type_val: fee.fee_type,
                                fee_value: parseFloat(newValue),
                                status: fee.status
                              }, 'crypto_platform');
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crypto Blockchain Fees</CardTitle>
              <CardDescription>Network fees and minimum amounts for each crypto/network pair</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Crypto</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Blockchain Fee</TableHead>
                    <TableHead>Minimum Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cryptoFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.crypto_type}</TableCell>
                      <TableCell>{fee.network_type}</TableCell>
                      <TableCell>${fee.blockchain_fee}</TableCell>
                      <TableCell>${fee.min_amount}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newFee = prompt('Enter new blockchain fee:', fee.blockchain_fee);
                            const newMin = prompt('Enter new minimum amount:', fee.min_amount);
                            if (newFee && newMin) {
                              handleUpdateTransferFee({
                                crypto_type: fee.crypto_type,
                                network_type: fee.network_type,
                                blockchain_fee: parseFloat(newFee),
                                min_amount: parseFloat(newMin),
                                status: fee.status
                              }, 'crypto');
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="momo-fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MOMO Transfer Fees</CardTitle>
              <CardDescription>Platform fees for MOMO transfers (Min: 5 GHS, Max: 1000 GHS)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount Range (GHS)</TableHead>
                    <TableHead>Platform Fee (GHS)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {momoFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell>
                        ₵{fee.min_amount} - ₵{fee.max_amount}
                      </TableCell>
                      <TableCell className="font-medium">₵{fee.platform_fee}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            const newFee = prompt('Enter new platform fee (GHS):', fee.platform_fee);
                            if (newFee) {
                              handleUpdateTransferFee({
                                id: fee.id,
                                platform_fee: parseFloat(newFee),
                                status: fee.status
                              }, 'momo');
                            }
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}