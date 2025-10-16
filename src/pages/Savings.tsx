import { useState, useEffect } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { TopHeader } from "@/components/TopHeader";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { CreateSavingsTarget } from "@/components/CreateSavingsTarget";
import { useFeatures } from "@/hooks/useFeatures";
import { useNavigate } from "react-router-dom";

const Savings = () => {
  const navigate = useNavigate();
  const { isFeatureEnabled } = useFeatures();
  const [showCreateTarget, setShowCreateTarget] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Redirect if feature is disabled
  useEffect(() => {
    if (!isFeatureEnabled('savings')) {
      navigate('/');
    }
  }, [isFeatureEnabled, navigate]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />
      
      <div className="p-4 space-y-6">
        {/* Target Savings Balance Card */}
        <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 left-4">
            <span className="bg-black/20 text-white text-xs px-2 py-1 rounded-full">
              9% per annum
            </span>
          </div>
          
          <div className="mt-8">
            <p className="text-white/90 text-sm mb-2">Target Savings Balance</p>
            <h2 className="text-4xl font-bold">₦0</h2>
          </div>
        </div>

        {/* What is Target Savings Info */}
        {showInfo && (
          <div className="bg-pink-100 rounded-xl p-4 relative">
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
            
            <h3 className="font-semibold text-gray-800 mb-2">What is Target Savings?</h3>
            <p className="text-gray-700 text-sm mb-2">
              Target Savings is a great way to save towards a specific goal or target
            </p>
            <p className="text-gray-700 text-sm">
              You can save towards a goal like a vacation, a wedding, a new car, a house, or even a business
            </p>
          </div>
        )}
      </div>

      {/* Add Target Button */}
      <div className="fixed bottom-24 right-6">
        <Button
          onClick={() => setShowCreateTarget(true)}
          size="icon"
          className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg"
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Create Target Modal */}
      {showCreateTarget && (
        <CreateSavingsTarget onClose={() => setShowCreateTarget(false)} />
      )}

      <BottomNavigation />
    </div>
  );
};

export default Savings;