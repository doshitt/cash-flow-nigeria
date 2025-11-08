import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Filter, UserPlus, Eye, MoreHorizontal, Mail, Phone, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { getAdminApiUrl } from "@/config/admin-api";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: string;
  status: string;
  kyc_status: string;
  tier: string;
  join_date: string;
  total_transactions: number;
  total_spent: string;
}

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    newThisMonth: 0
  });
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundCurrency, setFundCurrency] = useState("NGN");
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${getAdminApiUrl('/customers.php')}?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.data);
        
        // Calculate stats from real data
        const now = new Date();
        setStats({
          total: data.pagination.total,
          active: data.data.filter((c: Customer) => c.status === 'active').length,
          verified: data.data.filter((c: Customer) => 
            c.kyc_status === 'verified' || c.kyc_status === 'approved'
          ).length,
          newThisMonth: data.data.filter((c: Customer) => {
            const joinDate = new Date(c.join_date);
            return joinDate.getMonth() === now.getMonth() && 
                   joinDate.getFullYear() === now.getFullYear();
          }).length
        });
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async () => {
    if (!selectedCustomer || !fundAmount || parseFloat(fundAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(getAdminApiUrl('/add_funds.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedCustomer.id,
          currency: fundCurrency,
          amount: parseFloat(fundAmount),
          admin_note: adminNote
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: `Added ${fundAmount} ${fundCurrency} to ${selectedCustomer.name}'s wallet`,
        });
        setShowAddFunds(false);
        setFundAmount("");
        setAdminNote("");
        fetchCustomers(); // Refresh customer list
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add funds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Suspended</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
      case "approved":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Verified</Badge>;
      case "pending":
      case "under_review":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pending</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer accounts and KYC verification
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KYC Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Verified accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Recent signups</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                View and manage all customer accounts
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No customers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {customer.name ? customer.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{customer.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-1 h-3 w-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-1 h-3 w-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{customer.balance}</TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>{getKycBadge(customer.kyc_status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{customer.tier}</Badge>
                    </TableCell>
                    <TableCell>{new Date(customer.join_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedCustomer(customer);
                            setShowAddFunds(true);
                          }}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Add Funds
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Edit Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Suspend Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Customer Wallet</DialogTitle>
            <DialogDescription>
              Add funds to {selectedCustomer?.name}'s wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={fundCurrency} onValueChange={setFundCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GHS">GHS - Ghana Cedis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Admin Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Reason for adding funds..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddFunds(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFunds} disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
