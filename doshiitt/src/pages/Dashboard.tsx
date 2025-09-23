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

const stats = [
  {
    title: "Total Users",
    value: "12,543",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Total Revenue",
    value: "₦2,457,890",
    change: "+8.2%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    title: "Active Cards",
    value: "8,234",
    change: "+4.1%",
    trend: "up",
    icon: CreditCard,
    color: "text-purple-600"
  },
  {
    title: "Transaction Volume",
    value: "₦45.2M",
    change: "-2.3%",
    trend: "down",
    icon: TrendingUp,
    color: "text-orange-600"
  }
];

const revenueData = [
  { month: "Jan", revenue: 4000, transactions: 240 },
  { month: "Feb", revenue: 3000, transactions: 139 },
  { month: "Mar", revenue: 2000, transactions: 980 },
  { month: "Apr", revenue: 2780, transactions: 390 },
  { month: "May", revenue: 1890, transactions: 480 },
  { month: "Jun", revenue: 2390, transactions: 380 },
];

const recentTransactions = [
  { id: "TXN001", user: "John Doe", amount: "₦15,000", type: "Transfer", status: "completed" },
  { id: "TXN002", user: "Jane Smith", amount: "₦8,500", type: "Airtime", status: "completed" },
  { id: "TXN003", user: "Mike Johnson", amount: "₦25,000", type: "Transfer", status: "pending" },
  { id: "TXN004", user: "Sarah Wilson", amount: "₦3,200", type: "Data", status: "failed" },
  { id: "TXN005", user: "David Brown", amount: "₦12,000", type: "Voucher", status: "completed" },
];

export default function Dashboard() {
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
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
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
              <AreaChart data={revenueData}>
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
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium leading-none">{transaction.user}</p>
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
                  <div className="font-medium">{transaction.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}