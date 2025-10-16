import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, TrendingUp, Gift, CreditCard, Send, Globe, Smartphone, ShoppingBag } from "lucide-react";
import { getApiUrl, API_CONFIG } from "@/config/api";

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: any;
  is_enabled: boolean;
}

const PLATFORM_FEATURES: Omit<Feature, 'is_enabled'>[] = [
  { id: 'bank_transfer', name: 'Bank Transfer (Nigeria)', description: 'Send money to Nigerian bank accounts', icon: Send },
  { id: 'international_transfer', name: 'International Transfer', description: 'Send money to international bank accounts', icon: Globe },
  { id: 'tesapay_transfer', name: 'TesaPay User Transfer', description: 'Send money to other TesaPay users', icon: TrendingUp },
  { id: 'airtime', name: 'Airtime Purchase', description: 'Buy airtime for any network', icon: Smartphone },
  { id: 'data', name: 'Data Purchase', description: 'Buy data bundles', icon: Zap },
  { id: 'add_via_bank', name: 'Add Money via Bank', description: 'Add funds via bank transfer', icon: CreditCard },
  { id: 'add_via_card', name: 'Add Money via Card', description: 'Add funds using debit/credit card', icon: CreditCard },
  { id: 'voucher', name: 'Voucher/Gift Cards', description: 'Create and redeem gift vouchers', icon: Gift },
  { id: 'savings', name: 'Savings', description: 'Create and manage savings targets', icon: ShoppingBag },
];

export default function Features() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: features, isLoading } = useQuery({
    queryKey: ['platform-features'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/admin/features.php'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch features');
      const data = await response.json();
      return data.features as Feature[];
    },
  });

  const toggleFeature = useMutation({
    mutationFn: async ({ featureId, enabled }: { featureId: string; enabled: boolean }) => {
      const response = await fetch(getApiUrl('/admin/features.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({
          action: 'toggle',
          feature_id: featureId,
          is_enabled: enabled,
        }),
      });
      if (!response.ok) throw new Error('Failed to update feature');
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['platform-features'] });
      toast({
        title: "Feature Updated",
        description: `${variables.featureId} has been ${variables.enabled ? 'enabled' : 'disabled'}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feature status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Features</h1>
        <p className="text-muted-foreground mt-2">
          Control which features are visible and available to users on the platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features?.map((feature) => {
          const featureConfig = PLATFORM_FEATURES.find(f => f.id === feature.id);
          const Icon = featureConfig?.icon || Zap;
          
          return (
            <Card key={feature.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{feature.name}</CardTitle>
                    </div>
                  </div>
                  <Switch
                    checked={feature.is_enabled}
                    onCheckedChange={(checked) => {
                      toggleFeature.mutate({ featureId: feature.id, enabled: checked });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${feature.is_enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-muted-foreground">
                    {feature.is_enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
