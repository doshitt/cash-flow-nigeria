import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

const CardsAndBanks = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'card' | 'bank'>('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    pin: ''
  });

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      // Remove all spaces and format with spaces every 4 digits
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      // Mask the middle digits
      if (formattedValue.length > 8) {
        const first4 = formattedValue.substring(0, 4);
        const last4 = formattedValue.substring(formattedValue.length - 4);
        const middle = '*** *** ';
        formattedValue = first4 + ' ' + middle + last4;
      }
    } else if (field === 'expiry') {
      // Format as MM/YYYY
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 6);
      }
    } else if (field === 'cvv' || field === 'pin') {
      // Mask with x
      formattedValue = value.replace(/./g, 'x');
    }

    setCardData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleAddCard = async () => {
    if (!cardData.cardNumber || !cardData.expiry || !cardData.cvv || !cardData.pin) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(getApiUrl('/add_card.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1, // Replace with actual user ID
          card_number: cardData.cardNumber.replace(/\s/g, ''),
          expiry: cardData.expiry,
          cvv: cardData.cvv,
          pin: cardData.pin
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Card added successfully");
        setCardData({
          cardNumber: '',
          expiry: '',
          cvv: '',
          pin: ''
        });
      } else {
        toast.error(result.message || "Failed to add card");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto relative">
      {/* Status bar simulation */}
      <div className="flex items-center justify-between px-4 py-2 text-sm font-medium">
        <span>9:27</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-muted-foreground rounded-full"></div>
          </div>
          <span className="ml-2">📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-6">
        <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">Cards and Banks</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 space-y-6">
        {/* Tab Selection */}
        <div className="flex bg-muted/30 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('card')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'card' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            Debit card
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'bank' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground'
            }`}
          >
            Bank Account
          </button>
        </div>

        {activeTab === 'card' && (
          <div className="space-y-4">
            {/* Card Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Card Number</label>
                <Input
                  placeholder="30 *** *** 09"
                  value={cardData.cardNumber}
                  onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                  className="bg-muted/30"
                  maxLength={19}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expire</label>
                <Input
                  placeholder="xx/xxxx"
                  value={cardData.expiry}
                  onChange={(e) => handleInputChange('expiry', e.target.value)}
                  className="bg-muted/30"
                  maxLength={7}
                />
              </div>
            </div>

            {/* CVV and Pin */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">CVV</label>
                <Input
                  placeholder="xx/xxxx"
                  value={cardData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value)}
                  className="bg-muted/30"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pin</label>
                <Input
                  placeholder="xx/xxxx"
                  value={cardData.pin}
                  onChange={(e) => handleInputChange('pin', e.target.value)}
                  className="bg-muted/30"
                  maxLength={4}
                />
              </div>
            </div>

            <Button 
              className="w-full bg-primary text-white py-3 rounded-xl font-medium mt-8"
              onClick={handleAddCard}
            >
              Add Card
            </Button>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Bank account management coming soon</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CardsAndBanks;