import { useState } from "react";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountProfilePopup } from "./AccountProfilePopup";
import { NotificationPopup } from "./NotificationPopup";
import { SearchPopup } from "./SearchPopup";

export const TopHeader = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex items-center gap-4 p-4 pb-6">
      <div className="flex-1 relative" onClick={() => setSearchOpen(true)}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
        <Input 
          placeholder="Search anything..." 
          className="pl-10 bg-muted border-0 rounded-full cursor-pointer"
          readOnly
        />
      </div>
      
      <SearchPopup open={searchOpen} onOpenChange={setSearchOpen} />
      
      <NotificationPopup>
        <Button variant="ghost" size="sm" className="relative p-2">
          <Bell size={20} className="text-foreground" />
        </Button>
      </NotificationPopup>
      
      <AccountProfilePopup>
        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      </AccountProfilePopup>
    </div>
  );
};