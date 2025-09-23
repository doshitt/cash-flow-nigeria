import { ArrowLeft, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiUrl } from "@/config/api";

type PinStep = 'current' | 'new' | 'confirm';

const AccountPin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<PinStep>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const getDisplayPin = () => {
    switch (step) {
      case 'current': return currentPin;
      case 'new': return newPin;
      case 'confirm': return confirmPin;
      default: return '';
    }
  };

  const setPin = (pin: string) => {
    switch (step) {
      case 'current': setCurrentPin(pin); break;
      case 'new': setNewPin(pin); break;
      case 'confirm': setConfirmPin(pin); break;
    }
  };

  const addNumber = (num: string) => {
    const currentDisplayPin = getDisplayPin();
    if (currentDisplayPin.length < 5) {
      setPin(currentDisplayPin + num);
    }
  };

  const removeNumber = () => {
    const currentDisplayPin = getDisplayPin();
    setPin(currentDisplayPin.slice(0, -1));
  };

  const handleContinue = async () => {
    const currentDisplayPin = getDisplayPin();
    
    if (currentDisplayPin.length !== 5) {
      toast.error("Please enter a 5-digit PIN");
      return;
    }

    if (step === 'current') {
      // Verify current PIN
      try {
        const response = await fetch(getApiUrl('/verify_pin.php'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 1, // Replace with actual user ID
            pin: currentPin
          })
        });

        const result = await response.json();

        if (result.success) {
          setStep('new');
        } else {
          toast.error("Current PIN is incorrect");
          setCurrentPin('');
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else if (step === 'new') {
      setStep('confirm');
    } else if (step === 'confirm') {
      if (newPin !== confirmPin) {
        toast.error("PINs don't match");
        setConfirmPin('');
        return;
      }

      // Update PIN
      try {
        const response = await fetch(getApiUrl('/update_pin.php'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 1, // Replace with actual user ID
            new_pin: newPin
          })
        });

        const result = await response.json();

        if (result.success) {
          toast.success("PIN changed successfully");
          navigate(-1);
        } else {
          toast.error(result.message || "Failed to change PIN");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'current': return 'Enter current pin';
      case 'new': return 'Enter new pin';
      case 'confirm': return 'Confirm new pin';
      default: return '';
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 'current':
      case 'new': return 'Continue';
      case 'confirm': return 'Change';
      default: return 'Continue';
    }
  };

  const pinDisplay = getDisplayPin();

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
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
        <div className="w-8" />
      </div>

      <div className="px-4 flex flex-col h-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold">{getTitle()}</h1>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-12">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`w-12 h-1 rounded-full transition-colors ${
                index < pinDisplay.length ? 'bg-foreground' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => addNumber(num.toString())}
              className="w-16 h-16 mx-auto text-2xl font-medium rounded-full hover:bg-muted/30 transition-colors"
            >
              {num}
            </button>
          ))}
          
          {/* Bottom row */}
          <div></div>
          <button
            onClick={() => addNumber('0')}
            className="w-16 h-16 mx-auto text-2xl font-medium rounded-full hover:bg-muted/30 transition-colors"
          >
            0
          </button>
          <button
            onClick={removeNumber}
            className="w-16 h-16 mx-auto flex items-center justify-center rounded-full hover:bg-muted/30 transition-colors"
          >
            <Delete size={20} className="rotate-180" />
          </button>
        </div>

        {/* Continue Button */}
        <div className="px-4 pb-8">
          <Button 
            className="w-full bg-primary text-white py-3 rounded-xl font-medium"
            onClick={handleContinue}
            disabled={pinDisplay.length !== 5}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AccountPin;