import { ArrowLeft, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: "completed" | "pending" | "failed";
  category: "inflow" | "outflow";
  service: string;
  date: string;
  reference: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "Transfer Received",
    amount: 50000,
    currency: "NGN",
    description: "From John Smith",
    status: "completed",
    category: "inflow",
    service: "transfer",
    date: "2024-01-15T10:30:00Z",
    reference: "TXN123456789"
  },
  {
    id: "2",
    type: "Airtime Purchase",
    amount: 1000,
    currency: "NGN",
    description: "MTN Airtime - 08123456789",
    status: "completed",
    category: "outflow",
    service: "airtime",
    date: "2024-01-14T15:45:00Z",
    reference: "AIR987654321"
  },
  {
    id: "3",
    type: "Voucher Created",
    amount: 5000,
    currency: "NGN",
    description: "Gift Voucher for Birthday",
    status: "completed",
    category: "outflow",
    service: "voucher",
    date: "2024-01-13T09:20:00Z",
    reference: "VOU456789123"
  },
  {
    id: "4",
    type: "Currency Conversion",
    amount: 100,
    currency: "USD",
    description: "NGN to USD conversion",
    status: "completed",
    category: "inflow",
    service: "conversion",
    date: "2024-01-12T14:15:00Z",
    reference: "CNV789123456"
  },
  {
    id: "5",
    type: "Data Purchase",
    amount: 2000,
    currency: "NGN",
    description: "5GB Data Bundle - Glo",
    status: "completed",
    category: "outflow",
    service: "data",
    date: "2024-01-11T11:30:00Z",
    reference: "DAT321654987"
  }
];

const RecentTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedService, setSelectedService] = useState<string>("all");

  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(tx => tx.category === selectedCategory);
    }

    if (selectedService !== "all") {
      filtered = filtered.filter(tx => tx.service === selectedService);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, selectedCategory, selectedService]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      NGN: "₦",
      USD: "$",
      GBP: "£",
      EUR: "€",
      GHS: "₵"
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryIcon = (category: string) => {
    return category === "inflow" ? "↓" : "↑";
  };

  const getCategoryColor = (category: string) => {
    return category === "inflow" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto relative">
      {/* Status bar simulation */}
      <div className="flex items-center justify-between px-4 py-2 text-sm font-medium">
        <span>9:27</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-muted-foreground rounded-full"></div>
          </div>
          <span className="ml-2">📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-6">
        <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">Recent Transactions</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Search transactions..." 
            className="pl-10 bg-muted border-0 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="inflow">Inflow</SelectItem>
              <SelectItem value="outflow">Outflow</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="airtime">Airtime</SelectItem>
              <SelectItem value="data">Data</SelectItem>
              <SelectItem value="voucher">Voucher</SelectItem>
              <SelectItem value="conversion">Conversion</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions List */}
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 border-0 card-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                    <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{transaction.type}</h3>
                    <p className="text-xs text-muted-foreground">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${getCategoryColor(transaction.category)}`}>
                    {transaction.category === "inflow" ? "+" : "-"}
                    {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                  <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">Ref: {transaction.reference}</p>
              </div>
            </Card>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;