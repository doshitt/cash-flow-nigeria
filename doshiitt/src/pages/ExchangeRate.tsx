import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, RefreshCw, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const exchangeRates = [
  {
    currency: "USD",
    flag: "🇺🇸",
    buyRate: "750.00",
    sellRate: "755.00",
    lastUpdate: "2023-12-01 14:30",
    change: "+0.5%",
    trend: "up"
  },
  {
    currency: "GBP",
    flag: "🇬🇧",
    buyRate: "920.00",
    sellRate: "925.00",
    lastUpdate: "2023-12-01 14:30",
    change: "-0.2%",
    trend: "down"
  },
  {
    currency: "EUR",
    flag: "🇪🇺",
    buyRate: "810.00",
    sellRate: "815.00",
    lastUpdate: "2023-12-01 14:30",
    change: "+0.1%",
    trend: "up"
  }
];

export default function ExchangeRate() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exchange Rates</h1>
          <p className="text-muted-foreground">Manage currency exchange rates and spreads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Rates
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Update Rates</Button>
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
                  <Label htmlFor="currency" className="text-right">Currency</Label>
                  <Input id="currency" value="USD" className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="buyRate" className="text-right">Buy Rate</Label>
                  <Input id="buyRate" placeholder="750.00" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sellRate" className="text-right">Sell Rate</Label>
                  <Input id="sellRate" placeholder="755.00" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsDialogOpen(false)}>Update</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Current Exchange Rates</CardTitle>
          <CardDescription>Manage buy and sell rates for all supported currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency</TableHead>
                <TableHead>Buy Rate (NGN)</TableHead>
                <TableHead>Sell Rate (NGN)</TableHead>
                <TableHead>24h Change</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exchangeRates.map((rate) => (
                <TableRow key={rate.currency}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{rate.flag}</span>
                      <span className="font-medium">{rate.currency}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">₦{rate.buyRate}</TableCell>
                  <TableCell className="font-medium">₦{rate.sellRate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {rate.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={rate.trend === "up" ? "text-green-500" : "text-red-500"}>
                        {rate.change}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{rate.lastUpdate}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}