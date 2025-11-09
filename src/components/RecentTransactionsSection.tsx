import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "@/config/api";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: "completed" | "pending" | "failed";
  category: "inflow" | "outflow";
  date: string;
}

export const RecentTransactionsSection = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const token = localStorage.getItem('tesapay_session_token') || '';
        const res = await fetch(`/backend/transactions.php?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          const mapped: Transaction[] = (data.data || []).map((t: any) => ({
            id: t.transaction_id,
            type: t.transaction_type,
            amount: Number(t.amount),
            currency: t.currency,
            description: t.description || t.transaction_type,
            status: t.status,
            category: ['deposit','voucher_redeem','transfer_in'].includes((t.transaction_type || '').toLowerCase()) ? 'inflow' : 'outflow',
            date: t.created_at
          }));
          setTransactions(mapped);
        }
      } catch (e) {
        console.error('Failed to load transactions:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const getCategoryColor = (category: 'inflow' | 'outflow') =>
    category === 'inflow' ? 'text-green-600' : 'text-red-600';

  const getCategoryIcon = (category: 'inflow' | 'outflow') =>
    category === 'inflow' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />;

  const formatDate = (d: string) => {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const now = new Date();
    const diff = now.getTime() - dt.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) return hours < 1 ? 'Just now' : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatAmount = (amt: number, currency: string) =>
    `${currency} ${Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const getStatusColor = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-12 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Transactions</h2>
        <Button variant="ghost" size="sm" onClick={() => navigate('/recent-transactions')}>
          View All
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No transactions yet</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getCategoryColor(transaction.category)}`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{transaction.type}</h3>
                    <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className={`font-semibold text-sm ${getCategoryColor(transaction.category)}`}>
                    {transaction.category === "inflow" ? "+" : "-"}
                    {formatAmount(transaction.amount, transaction.currency)}
                  </p>
                  <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
