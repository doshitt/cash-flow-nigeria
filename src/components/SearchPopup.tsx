import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SearchResult {
  label: string;
  path: string;
  icon: string;
  category: string;
}

const searchableItems: SearchResult[] = [
  { label: "Add Money", path: "/", icon: "💰", category: "Services" },
  { label: "Transfer", path: "/transfer", icon: "💸", category: "Services" },
  { label: "Airtime", path: "/airtime", icon: "📱", category: "Bills" },
  { label: "Data", path: "/data", icon: "📶", category: "Bills" },
  { label: "Electricity", path: "/electricity", icon: "💡", category: "Bills" },
  { label: "TV Subscription", path: "/tv", icon: "📺", category: "Bills" },
  { label: "Betting", path: "/betting", icon: "📊", category: "Bills" },
  { label: "Gift Vouchers", path: "/vouchers", icon: "🎁", category: "Services" },
  { label: "Wallet", path: "/wallet", icon: "👛", category: "Account" },
  { label: "Profile", path: "/profile", icon: "👤", category: "Account" },
  { label: "KYC Verification", path: "/kyc-verification", icon: "✅", category: "Account" },
  { label: "Recent Transactions", path: "/recent-transactions", icon: "📄", category: "Account" },
  { label: "Refer & Earn", path: "/refer-and-earn", icon: "🎯", category: "Account" },
  { label: "Cards & Banks", path: "/cards-banks", icon: "💳", category: "Account" },
  { label: "Transaction Limits", path: "/transaction-limits", icon: "⚠️", category: "Account" },
  { label: "Change Password", path: "/change-password", icon: "🔑", category: "Security" },
  { label: "Account Pin", path: "/account-pin", icon: "🔐", category: "Security" },
  { label: "Notifications", path: "/notifications", icon: "🔔", category: "Account" },
];

interface SearchPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchPopup = ({ open, onOpenChange }: SearchPopupProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setResults(searchableItems.slice(0, 8)); // Show top 8 by default
    } else {
      const filtered = searchableItems.filter(
        (item) =>
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
    }
  }, [searchTerm]);

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search for services, transactions, settings..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {results.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No results found</p>
              </Card>
            ) : (
              results.map((item) => (
                <Card
                  key={item.path}
                  className="p-3 cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSelect(item.path)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
