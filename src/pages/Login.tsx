import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Fingerprint } from "lucide-react";

export const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePhoneLogin = async () => {
    if (!phoneNumber || !pin) {
      toast({
        title: "Error",
        description: "Please enter both phone number and PIN",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/backend/auth/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          pin: pin,
          login_method: 'phone_pin'
        }),
      });

      const data = await response.json();

      if (data.success) {
        await login(data.user, data.session_token);
        toast({
          title: "Login Successful",
          description: "Welcome back to TesaPay!",
        });
        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid phone number or PIN",
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

  const handleBiometricLogin = async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential) {
        toast({
          title: "Not Supported",
          description: "Biometric authentication is not supported on this device",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      
      // In a real implementation, you would get stored credentials
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          timeout: 60000,
          userVerification: "required"
        }
      });

      if (credential) {
        // Send credential to backend for verification
        const response = await fetch('/backend/auth/biometric_login.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: credential,
            login_method: 'biometric'
          }),
        });

        const data = await response.json();

        if (data.success) {
          await login(data.user, data.session_token);
          toast({
            title: "Biometric Login Successful",
            description: "Welcome back to TesaPay!",
          });
          navigate("/");
        }
      }
    } catch (error) {
      toast({
        title: "Biometric Authentication Failed",
        description: "Please try again or use PIN login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome to Tesapay</h1>
        </div>

        {!showBiometric ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="pin">PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={5}
                  className="mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => navigate("/forgot-pin")}
            >
              Forgotten password?
            </button>

            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={handlePhoneLogin}
              disabled={isLoading || !phoneNumber || !pin}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowBiometric(true)}
                className="text-primary hover:bg-primary/10"
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Use Biometric Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Fingerprint size={32} className="text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-semibold">Tap the face icon to use face Id & Unlock</h2>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="w-8 h-8 border-2 border-foreground rounded"></div>
                  <div className="w-8 h-8 border-2 border-foreground rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-foreground rounded-full"></div>
                  </div>
                  <div className="w-8 h-8 border-2 border-foreground rounded"></div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90" 
              onClick={handleBiometricLogin}
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Use Face ID"}
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowBiometric(false)}
              className="w-full"
            >
              Back to PIN Login
            </Button>
          </div>
        )}

        <div className="text-center pt-4">
          <span className="text-sm text-muted-foreground">New User? </span>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-primary hover:underline font-medium"
          >
            Create Account
          </button>
        </div>
      </Card>
    </div>
  );
};