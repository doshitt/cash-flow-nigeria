import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AccountProfilePopupProps {
  children: React.ReactNode;
}

export const AccountProfilePopup = ({ children }: AccountProfilePopupProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const handleEarnAndRefer = () => {
    navigate('/refer-and-earn');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-auto p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face" />
            <AvatarFallback>{user?.first_name?.[0]}{user?.last_name?.[0]}</AvatarFallback>
          </Avatar>
          
          <div>
            <h2 className="text-xl font-semibold">{user?.full_name}</h2>
            <div className="flex items-center justify-center gap-6 mt-3 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-semibold text-foreground">421</div>
                <div>Transaction</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">92</div>
                <div>Utility</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">2</div>
                <div>Level</div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Number:</span>
              <span>{user?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Number:</span>
              <span>0815678467</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Bank Name:</span>
              <span>Wema bank</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Bvn:</span>
              <span>Wema bank</span>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button 
              onClick={handleEditProfile}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              Edit Profile
            </Button>
            <Button 
              onClick={handleEarnAndRefer}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-white"
            >
              Earn and Refer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};