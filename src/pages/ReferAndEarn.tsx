import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNavigation } from "@/components/BottomNavigation";

const ReferAndEarn = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto relative">
      {/* Header */}
      <div className="flex items-center p-4">
        <button 
          onClick={() => navigate("/")}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 space-y-8">
        {/* Illustration */}
        <div className="flex justify-center mt-8">
          <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-destructive/20 rounded-full flex items-center justify-center">
            <div className="text-6xl">👥</div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Invite friends and Earn</h1>
          <p className="text-muted-foreground leading-relaxed">
            The regular program is temporarily unavailable, 
            please check back later.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mt-12">
          <Button 
            className="w-full h-12 bg-destructive hover:bg-destructive/90 text-white"
            onClick={() => {
              // Handle invite friend functionality
              navigator.share?.({
                title: 'Join TesaPay',
                text: 'Join me on TesaPay - the best way to manage your money!',
                url: window.location.origin + '?ref=USER123'
              }).catch(() => {
                // Fallback for browsers that don't support native sharing
                navigator.clipboard.writeText(window.location.origin + '?ref=USER123');
              });
            }}
          >
            Invite a Friend
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={() => {
              // Handle enter referral code
            }}
          >
            Enter Referral Code
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={() => {
              // Handle view referral history
            }}
          >
            View Referral History
          </Button>
          
          <div className="text-center mt-6">
            <Button 
              variant="link" 
              className="text-destructive hover:text-destructive/80"
              onClick={() => {
                // Handle terms and conditions
              }}
            >
              View Terms and Conditions
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ReferAndEarn;