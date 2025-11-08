import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getAdminApiUrl } from "@/config/admin-api";

export default function KYCVerifications() {
  const queryClient = useQueryClient();
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [tier, setTier] = useState<'tier_1' | 'tier_2'>('tier_1');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch all KYC submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ['admin-kyc-submissions', statusFilter],
    queryFn: async () => {
      const baseUrl = getAdminApiUrl('/kyc_verifications.php');
      const url = statusFilter === 'all' 
        ? baseUrl
        : `${baseUrl}?status=${encodeURIComponent(statusFilter)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      return data.success ? data.submissions : [];
    },
  });

  // Fetch detailed KYC info
  const viewKYCDetails = useMutation({
    mutationFn: async (kycId: number) => {
      const response = await fetch(getAdminApiUrl('/kyc_verifications.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kyc_id: kycId }),
      });
      const data = await response.json();
      return data.success ? data.kyc : null;
    },
    onSuccess: (data) => {
      setSelectedKYC(data);
    },
  });

  // Review KYC (approve/reject)
  const reviewKYC = useMutation({
    mutationFn: async () => {
      if (!selectedKYC || !reviewAction) return;
      
      const response = await fetch(getAdminApiUrl('/kyc_verifications.php'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kyc_id: selectedKYC.id,
          action: reviewAction,
          tier: reviewAction === 'approve' ? tier : undefined,
          comments,
          rejection_reason: reviewAction === 'reject' ? rejectionReason : undefined,
        }),
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `KYC ${reviewAction}d successfully`,
      });
      setSelectedKYC(null);
      setReviewAction(null);
      setComments('');
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-submissions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to review KYC",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
      under_review: { variant: "outline", icon: Clock },
    };
    
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Verifications</h1>
        <p className="text-muted-foreground">Review and approve customer verification requests</p>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>KYC Submissions</CardTitle>
          <CardDescription>
            {submissions?.length || 0} total submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading submissions...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions?.map((kyc: any) => (
                  <TableRow key={kyc.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{kyc.first_name} {kyc.last_name}</div>
                        <div className="text-sm text-muted-foreground">{kyc.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{kyc.account_type}</TableCell>
                    <TableCell>{getStatusBadge(kyc.verification_status)}</TableCell>
                    <TableCell className="uppercase">{kyc.kyc_tier?.replace('_', ' ')}</TableCell>
                    <TableCell>{kyc.document_count} files</TableCell>
                    <TableCell>{new Date(kyc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewKYCDetails.mutate(kyc.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* KYC Review Dialog */}
      <Dialog open={!!selectedKYC} onOpenChange={(open) => !open && setSelectedKYC(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Verification Review</DialogTitle>
            <DialogDescription>
              Review customer verification details and documents
            </DialogDescription>
          </DialogHeader>

          {selectedKYC && (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p className="font-medium">{selectedKYC.full_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedKYC.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedKYC.phone_number || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Nationality</Label>
                    <p className="font-medium">{selectedKYC.nationality}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Date of Birth</Label>
                    <p className="font-medium">{selectedKYC.date_of_birth}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account Type</Label>
                    <p className="font-medium capitalize">{selectedKYC.account_type}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Address Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>{selectedKYC.residential_address}</p>
                  <p>{selectedKYC.city}, {selectedKYC.state} {selectedKYC.postal_code}</p>
                  <p>{selectedKYC.country}</p>
                </CardContent>
              </Card>

              {/* Business Info (if applicable) */}
              {selectedKYC.account_type === 'business' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Business Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Company Name</Label>
                      <p className="font-medium">{selectedKYC.company_name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Registration Number</Label>
                      <p className="font-medium">{selectedKYC.registration_number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tax ID</Label>
                      <p className="font-medium">{selectedKYC.tax_id}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedKYC.documents?.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{doc.document_type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{doc.document_name}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${getAdminApiUrl('/kyc/view_document.php')}?id=${doc.id}`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Review Actions */}
              {(selectedKYC.verification_status === 'pending' || selectedKYC.verification_status === 'under_review') && !reviewAction && (
                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => setReviewAction('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve KYC
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setReviewAction('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject KYC
                  </Button>
                </div>
              )}

              {/* Approval Form */}
              {reviewAction === 'approve' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Approve KYC</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Assign Tier</Label>
                      <Select value={tier} onValueChange={(v: any) => setTier(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tier_1">Tier 1 - Limited Access ($100/month)</SelectItem>
                          <SelectItem value="tier_2">Tier 2 - Full Access (Unlimited)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Admin Comments (Optional)</Label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add any internal notes..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setReviewAction(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => reviewKYC.mutate()}>
                        Confirm Approval
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Form */}
              {reviewAction === 'reject' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reject KYC</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Rejection Reason *</Label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why the KYC is being rejected (user will see this)..."
                        required
                      />
                    </div>
                    <div>
                      <Label>Internal Comments (Optional)</Label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add any internal notes..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setReviewAction(null)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => reviewKYC.mutate()}
                        disabled={!rejectionReason}
                      >
                        Confirm Rejection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
