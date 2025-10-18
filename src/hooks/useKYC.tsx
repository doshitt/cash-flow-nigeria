import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiUrl } from "@/config/api";
import { useAuth } from "./useAuth";

export type KYCTier = 'tier_0' | 'tier_1' | 'tier_2';
export type KYCStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

interface KYCData {
  id: number;
  user_id: number;
  account_type: 'individual' | 'business';
  kyc_tier: KYCTier;
  verification_status: KYCStatus;
  full_name?: string;
  nationality?: string;
  date_of_birth?: string;
  phone_number?: string;
  residential_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  company_name?: string;
  registration_number?: string;
  tax_id?: string;
  business_address?: string;
  rejection_reason?: string;
  admin_comments?: string;
  documents?: any[];
  created_at: string;
  updated_at: string;
}

export const useKYC = () => {
  const { sessionToken, user } = useAuth();
  const queryClient = useQueryClient();

  const { data: kycData, isLoading } = useQuery({
    queryKey: ['kyc-status', user?.id],
    queryFn: async () => {
      if (!sessionToken) return null;
      
      const response = await fetch(getApiUrl('/kyc/submit_kyc.php'), {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      });
      
      if (!response.ok) return null;
      const data = await response.json();
      return data.success ? data : null;
    },
    enabled: !!sessionToken && !!user,
    staleTime: 30000, // 30 seconds
  });

  const submitKYC = useMutation({
    mutationFn: async (formData: any) => {
      const response = await fetch(getApiUrl('/kyc/submit_kyc.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('document_type', documentType);
      formData.append('session_token', sessionToken || '');
      
      const response = await fetch(getApiUrl('/kyc/upload_document.php'), {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
    },
  });

  const kycTier: KYCTier = kycData?.kyc_tier || 'tier_0';
  const kycStatus: KYCStatus = kycData?.kyc_status || 'pending';
  const kycDetails: KYCData | null = kycData?.kyc_data || null;
  const isVerified = kycStatus === 'approved';
  const needsKYC = kycStatus !== 'approved';
  const hasSubmitted = !!kycDetails;

  // Feature access control based on tier
  const canAccessFeature = (feature: string): boolean => {
    const tier0Features = ['view_wallet', 'view_transactions'];
    const tier1Features = [...tier0Features, 'bank_transfer', 'airtime', 'data', 'voucher'];
    const tier2Features = [...tier1Features, 'international_transfer', 'crypto', 'savings'];

    if (kycTier === 'tier_0') return tier0Features.includes(feature);
    if (kycTier === 'tier_1') return tier1Features.includes(feature);
    if (kycTier === 'tier_2') return tier2Features.includes(feature);
    
    return false;
  };

  const getTransactionLimit = (): number => {
    if (kycTier === 'tier_0') return 0;
    if (kycTier === 'tier_1') return 100; // $100
    if (kycTier === 'tier_2') return Infinity; // Unlimited
    return 0;
  };

  return {
    kycTier,
    kycStatus,
    kycDetails,
    isVerified,
    needsKYC,
    hasSubmitted,
    isLoading,
    submitKYC: submitKYC.mutate,
    uploadDocument: uploadDocument.mutate,
    canAccessFeature,
    getTransactionLimit,
  };
};
