import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useKYC } from "@/hooks/useKYC";

export const KYCAlertBanner = () => {
  const navigate = useNavigate();
  const { kycStatus, kycDetails, needsKYC, hasSubmitted } = useKYC();

  if (!needsKYC) return null;

  const getAlertContent = () => {
    switch (kycStatus) {
      case 'rejected':
        return {
          icon: <XCircle className="h-5 w-5 text-destructive" />,
          title: "KYC Verification Rejected",
          description: kycDetails?.rejection_reason || "Your KYC was rejected. Please update your information and resubmit.",
          variant: "destructive" as const,
          showButton: true,
          buttonText: "Resubmit KYC",
        };
      case 'under_review':
        return {
          icon: <AlertCircle className="h-5 w-5 text-warning" />,
          title: "KYC Under Review",
          description: "Your KYC submission is being reviewed. This usually takes 1-2 business days.",
          variant: "default" as const,
          showButton: false,
        };
      case 'pending':
      default:
        if (hasSubmitted) {
          return {
            icon: <AlertCircle className="h-5 w-5 text-warning" />,
            title: "KYC Under Review",
            description: "Your KYC submission is being reviewed. This usually takes 1-2 business days.",
            variant: "default" as const,
            showButton: false,
          };
        }
        return {
          icon: <AlertCircle className="h-5 w-5 text-warning" />,
          title: "Account Not Verified",
          description: "Your account is not yet verified. Complete KYC to access all features.",
          variant: "default" as const,
          showButton: true,
          buttonText: "Verify Now",
        };
    }
  };

  const alertContent = getAlertContent();

  return (
    <Alert variant={alertContent.variant} className="mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {alertContent.icon}
          <div className="flex-1">
            <h5 className="font-semibold mb-1">{alertContent.title}</h5>
            <AlertDescription>{alertContent.description}</AlertDescription>
          </div>
        </div>
        {alertContent.showButton && (
          <Button 
            onClick={() => navigate('/profile/kyc-verification')}
            size="sm"
            variant={kycStatus === 'rejected' ? 'destructive' : 'default'}
          >
            {alertContent.buttonText}
          </Button>
        )}
      </div>
    </Alert>
  );
};
