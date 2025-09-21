import { Home, CreditCard, PiggyBank, Wallet, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: CreditCard, label: "Card", id: "card" },
  { icon: PiggyBank, label: "Savings", id: "savings" },
  { icon: Wallet, label: "Wallet", id: "wallet" },
  { icon: User, label: "Profile", id: "profile" }
];

export const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-2 px-3 transition-colors ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      {/* Home indicator */}
      <div className="h-1 bg-foreground mx-auto w-32 rounded-full mb-1"></div>
    </div>
  );
};