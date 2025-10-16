import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { API_CONFIG, getApiUrl } from "@/config/api";

interface SignupData {
  surname: string;
  firstName: string;
  gender: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  pin: string;
  confirmPin: string;
}

export const Signup = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [formData, setFormData] = useState<SignupData>({
    surname: "",
    firstName: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    pin: "",
    confirmPin: ""
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  const updateFormData = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const { surname, firstName, gender, email, phone } = formData;
    if (!surname || !firstName || !gender || !email || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { password, confirmPassword } = formData;
    if (!password || !confirmPassword) {
      toast({
        title: "Password Required",
        description: "Please enter and confirm your password",
        variant: "destructive",
      });
      return false;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return false;
    }
    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (pin.length !== 5) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 5 digits",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (confirmPin !== pin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setFormData(prev => ({ ...prev, pin }));
      setStep(4);
    } else if (step === 4 && validateStep4()) {
      handleSignup();
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH_SIGNUP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pin: confirmPin
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Account Created Successfully",
          description: "Please check your phone for OTP verification",
        });
        navigate("/verify-otp", { state: { phone: formData.phone, userId: data.user_id } });
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "An error occurred during registration",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = (value: string, isConfirm = false) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 5);
    if (isConfirm) {
      setConfirmPin(numericValue);
    } else {
      setPin(numericValue);
    }
  };

  const PinKeypad = ({ onInput, currentPin }: { onInput: (digit: string) => void; currentPin: string }) => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-center space-x-2 mb-6">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`w-12 h-1 rounded-full ${
                currentPin.length > index ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
          {digits.slice(0, 9).map((digit) => (
            <Button
              key={digit}
              variant="ghost"
              className="h-16 text-2xl font-semibold"
              onClick={() => onInput(digit)}
              disabled={currentPin.length >= 5}
            >
              {digit}
            </Button>
          ))}
          <div></div>
          <Button
            variant="ghost"
            className="h-16 text-2xl font-semibold"
            onClick={() => onInput('0')}
            disabled={currentPin.length >= 5}
          >
            0
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-xl"
            onClick={() => {
              if (step === 3) {
                setPin(prev => prev.slice(0, -1));
              } else {
                setConfirmPin(prev => prev.slice(0, -1));
              }
            }}
          >
            ←
          </Button>
        </div>
      </div>
    );
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center space-x-2 mb-6">
      {[1, 2, 3, 4].map((stepNumber) => (
        <div
          key={stepNumber}
          className={`w-3 h-3 rounded-full ${
            stepNumber === step ? 'bg-primary' : stepNumber < step ? 'bg-primary/50' : 'bg-muted'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 space-y-6">
        {renderStepIndicator()}

        {step === 1 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-center">Basic Information</h1>
            
            <div>
              <Label htmlFor="surname">Surname</Label>
              <Input
                id="surname"
                placeholder="Johnson"
                value={formData.surname}
                onChange={(e) => updateFormData('surname', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="firstName">First name (as it appears on ID)</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => updateFormData('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
              />
            </div>

            <Button className="w-full" onClick={handleNext}>
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handlePrevious}>
                <ArrowLeft size={16} />
              </Button>
              <h1 className="text-2xl font-bold">Create password</h1>
            </div>

            <div>
              <Label htmlFor="password">Enter password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="referralCode">Referral code (optional)</Label>
              <Input
                id="referralCode"
                placeholder="Enter referral code"
                value={formData.referralCode}
                onChange={(e) => updateFormData('referralCode', e.target.value)}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              By clicking continue, you accept our terms of use and policy
            </p>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                Previous
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handlePrevious}>
                <ArrowLeft size={16} />
              </Button>
              <h1 className="text-2xl font-bold">Create your transaction pin</h1>
            </div>

            <div className="text-center">
              <p className="text-lg mb-4">Enter pin</p>
              <PinKeypad 
                onInput={(digit) => {
                  if (pin.length < 5) {
                    setPin(prev => prev + digit);
                  }
                }} 
                currentPin={pin}
              />
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                Previous
              </Button>
              <Button 
                onClick={handleNext} 
                className="flex-1"
                disabled={pin.length !== 5}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <Button variant="ghost" size="sm" onClick={handlePrevious}>
                <ArrowLeft size={16} />
              </Button>
              <h1 className="text-2xl font-bold">Confirm pin</h1>
            </div>

            <div className="text-center">
              <PinKeypad 
                onInput={(digit) => {
                  if (confirmPin.length < 5) {
                    setConfirmPin(prev => prev + digit);
                  }
                }} 
                currentPin={confirmPin}
              />
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handlePrevious} className="flex-1">
                Previous
              </Button>
              <Button 
                onClick={handleNext} 
                className="flex-1"
                disabled={confirmPin.length !== 5 || isLoading}
              >
                {isLoading ? "Creating Account..." : "Done"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};