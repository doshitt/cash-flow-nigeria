import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Download, Eye, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CoralPayTransaction {
  id: string;
  transaction_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  biller_type: string;
  customer_id: string;
  package_slug: string;
  amount: string;
  payment_reference: string;
  status: string;
  token: string | null;
  created_at: string;
  updated_at: string;
}

export default function CoralPayTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [billerFilter, setBillerFilter] = useState("all");
  const [transactions, setTransactions] = useState<CoralPayTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CoralPayTransaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, statusFilter, billerFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter,
        biller_type: billerFilter
      });
      
      const response = await fetch(`https://back.tesapay.com/admin/coralpay_transactions.php?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load transactions",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'User', 'Biller Type', 'Customer ID', 'Amount', 'Status', 'Date'];
    const rows = transactions.map(t => [
      t.transaction_id,
      t.user_name,
      t.biller_type,
      t.customer_id,
      t.amount,
      t.status,
      new Date(t.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coralpay_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Transactions exported successfully"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBillerBadge = (type: string) => {
    const colors: Record<string, string> = {
      airtime: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      data: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      electricity: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      tv: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
      betting: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
    };
    
    return <Badge className={colors[type] || ""}>{type.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CoralPay Transactions</h1>
          <p className="text-muted-foreground">
            Monitor all biller transactions processed through CoralPay
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={transactions.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All CoralPay Transactions</CardTitle>
              <CardDescription>
                Airtime, Data, Electricity, TV, and Betting transactions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={billerFilter} onValueChange={setBillerFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="airtime">Airtime</SelectItem>
                  <SelectItem value="data">Data</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="tv">TV</SelectItem>
                  <SelectItem value="betting">Betting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No transactions found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.user_name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getBillerBadge(transaction.biller_type)}</TableCell>
                    <TableCell className="font-mono text-sm">{transaction.customer_id}</TableCell>
                    <TableCell className="font-medium">₦{parseFloat(transaction.amount).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTransaction(transaction);
                            setShowDetails(true);
                          }}>
                            View Details
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

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information for transaction {selectedTransaction?.transaction_id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
                  <p className="text-sm font-mono">{selectedTransaction.transaction_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Reference</p>
                  <p className="text-sm font-mono">{selectedTransaction.payment_reference}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p className="text-sm">{selectedTransaction.user_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTransaction.user_email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customer ID</p>
                  <p className="text-sm font-mono">{selectedTransaction.customer_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Biller Type</p>
                  <p className="text-sm">{getBillerBadge(selectedTransaction.biller_type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Package</p>
                  <p className="text-sm">{selectedTransaction.package_slug}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-sm font-bold">₦{parseFloat(selectedTransaction.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-sm">{getStatusBadge(selectedTransaction.status)}</p>
                </div>
                {selectedTransaction.token && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Token</p>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{selectedTransaction.token}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Updated At</p>
                  <p className="text-sm">{new Date(selectedTransaction.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
