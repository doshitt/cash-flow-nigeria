import { Home, CreditCard, PiggyBank, Wallet, User } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", id: "home", path: "/" },
  { icon: CreditCard, label: "Card", id: "card", path: "/card" },
  { icon: PiggyBank, label: "Savings", id: "savings", path: "/savings" },
  { icon: Wallet, label: "Wallet", id: "wallet", path: "/wallet" },
  { icon: User, label: "Profile", id: "profile", path: "/profile" }
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeItem = navItems.find(item => item.path === currentPath);
    return activeItem ? activeItem.id : "home";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = getActiveTab() === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
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