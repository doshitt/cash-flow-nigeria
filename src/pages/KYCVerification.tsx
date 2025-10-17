import { useState } from "react";
import { ArrowLeft, Upload, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useKYC } from "@/hooks/useKYC";
import { TopHeader } from "@/components/TopHeader";

export default function KYCVerification() {
  const navigate = useNavigate();
  const { kycDetails, submitKYC, uploadDocument, kycStatus } = useKYC();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<'individual' | 'business'>('individual');
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  
  // Form data
  const [formData, setFormData] = useState({
    full_name: kycDetails?.full_name || '',
    nationality: kycDetails?.nationality || '',
    date_of_birth: kycDetails?.date_of_birth || '',
    phone_number: kycDetails?.phone_number || '',
    residential_address: kycDetails?.residential_address || '',
    city: kycDetails?.city || '',
    state: kycDetails?.state || '',
    country: kycDetails?.country || '',
    postal_code: kycDetails?.postal_code || '',
    company_name: kycDetails?.company_name || '',
    registration_number: kycDetails?.registration_number || '',
    tax_id: kycDetails?.tax_id || '',
    business_address: kycDetails?.business_address || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (!file) return;
    
    try {
      await uploadDocument({ file, documentType });
      setUploadedDocs({ ...uploadedDocs, [documentType]: true });
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  const handleSubmitStep1 = () => {
    // Validate required fields
    if (!formData.full_name || !formData.nationality || !formData.date_of_birth) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleFinalSubmit = async () => {
    // Validate address fields
    if (!formData.residential_address || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill all required address fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await submitKYC({ ...formData, account_type: accountType });
      toast({
        title: "KYC Submitted",
        description: "Your KYC information has been submitted for review",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit KYC",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <TopHeader />
      
      <div className="container max-w-2xl mx-auto px-4 pt-20">
        <Button
          variant="ghost"
          onClick={() => currentStep === 1 ? navigate(-1) : setCurrentStep(1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>KYC Verification</CardTitle>
            <CardDescription>
              Complete your verification to access all platform features
              {kycStatus === 'rejected' && kycDetails?.rejection_reason && (
                <div className="mt-2 p-3 bg-destructive/10 rounded-md text-destructive text-sm">
                  <strong>Rejection Reason:</strong> {kycDetails.rejection_reason}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Account Type Selection */}
            <Tabs value={accountType} onValueChange={(v) => setAccountType(v as any)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="individual">Individual</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
                </div>
                <div className={`h-0.5 w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  2
                </div>
              </div>
            </div>

            {/* Step 1: Personal/Business Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">
                  {accountType === 'individual' ? 'Personal Details' : 'Business Details'}
                </h3>
                
                <div>
                  <Label htmlFor="full_name">
                    {accountType === 'individual' ? 'Full Name' : 'Company Name'} *
                  </Label>
                  <Input
                    id="full_name"
                    name={accountType === 'individual' ? 'full_name' : 'company_name'}
                    value={accountType === 'individual' ? formData.full_name : formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Select
                    value={formData.nationality}
                    onValueChange={(v) => setFormData({ ...formData, nationality: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NG">Nigeria</SelectItem>
                      <SelectItem value="GH">Ghana</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="CN">China</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date_of_birth">Date of Birth *</Label>
                  <Input
                    id="date_of_birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+234..."
                  />
                </div>

                {accountType === 'business' && (
                  <>
                    <div>
                      <Label htmlFor="registration_number">Registration Number</Label>
                      <Input
                        id="registration_number"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax_id">Tax ID</Label>
                      <Input
                        id="tax_id"
                        name="tax_id"
                        value={formData.tax_id}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                {/* ID Document Upload */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-semibold mb-3">Upload ID Document</h4>
                  <div className="space-y-3">
                    <Label htmlFor="id_upload" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {uploadedDocs['passport'] ? 'Document Uploaded ✓' : 'Upload Passport, National ID, or Driver\'s License'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or PDF (max 5MB)</p>
                      </div>
                      <Input
                        id="id_upload"
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'passport');
                        }}
                      />
                    </Label>
                  </div>
                </div>

                <Button onClick={handleSubmitStep1} className="w-full mt-6">
                  Continue to Address Verification
                </Button>
              </div>
            )}

            {/* Step 2: Address Verification */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Address Verification</h3>
                
                <div>
                  <Label htmlFor="residential_address">
                    {accountType === 'individual' ? 'Residential Address' : 'Business Address'} *
                  </Label>
                  <Input
                    id="residential_address"
                    name={accountType === 'individual' ? 'residential_address' : 'business_address'}
                    value={accountType === 'individual' ? formData.residential_address : formData.business_address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(v) => setFormData({ ...formData, country: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NG">Nigeria</SelectItem>
                        <SelectItem value="GH">Ghana</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Address Proof Upload */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="font-semibold mb-3">Upload Address Proof</h4>
                  <Label htmlFor="address_upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {uploadedDocs['utility_bill'] ? 'Document Uploaded ✓' : 'Upload Utility Bill or Bank Statement'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, or PDF (max 5MB)</p>
                    </div>
                    <Input
                      id="address_upload"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'utility_bill');
                      }}
                    />
                  </Label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleFinalSubmit} className="flex-1">
                    Submit KYC
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
