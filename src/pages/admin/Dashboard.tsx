import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getAdminApiUrl, ADMIN_API_CONFIG } from "@/config/admin-api";

interface DashboardStats {
  total_users: number;
  total_revenue: number;
  active_cards: number;
  transaction_volume: number;
}

interface MonthlyData {
  month: string;
  revenue: number;
  transactions: number;
}

interface RecentTransaction {
  id: string;
  first_name: string;
  last_name: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
}

const fetchDashboardStats = async () => {
  const response = await fetch(getAdminApiUrl('/dashboard_stats.php'));
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
};

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading dashboard data</div>;
  }

  const stats = data?.data?.stats;
  const monthlyData = data?.data?.monthly_data || [];
  const recentTransactions = data?.data?.recent_transactions || [];

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.total_users?.toLocaleString() || "0",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Revenue",
      value: `₦${stats?.total_revenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Cards",
      value: stats?.active_cards?.toLocaleString() || "0",
      icon: CreditCard,
      color: "text-purple-600"
    },
    {
      title: "Transaction Volume",
      value: `₦${stats?.transaction_volume?.toLocaleString() || "0"}`,
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with TesaPay today.
          </p>
        </div>
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">Live data from platform</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Revenue and transaction trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Transaction Success Rate</CardTitle>
            <CardDescription>
              Payment success metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Successful Transactions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    94.2% success rate
                  </p>
                </div>
                <div className="ml-auto font-medium">94.2%</div>
              </div>
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div className="ml-2 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Failed Transactions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    5.8% failure rate
                  </p>
                </div>
                <div className="ml-auto font-medium">5.8%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Latest transactions on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction: RecentTransaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {transaction.first_name} {transaction.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{transaction.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{transaction.type}</Badge>
                  <Badge 
                    variant={
                      transaction.status === "completed" ? "default" :
                      transaction.status === "pending" ? "secondary" : "destructive"
                    }
                  >
                    {transaction.status}
                  </Badge>
                  <div className="font-medium">₦{transaction.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}