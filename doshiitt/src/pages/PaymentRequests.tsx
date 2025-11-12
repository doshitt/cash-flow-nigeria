import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Clock, Globe, CheckCircle, XCircle } from "lucide-react";

const API_BASE = '/backend';

interface PaymentRequest {
  id: string;
  transaction_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  transfer_type: 'momo' | 'crypto';
  amount: number;
  currency: string;
  recipient_info: any;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string;
  created_at: string;
}

export default function PaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/payment_requests.php`);
      const data = await response.json();
      
      if (data.success) {
        // Parse recipient_info if it's a string and ensure amount is a number
        const parsedRequests = data.data.map((req: any) => ({
          ...req,
          amount: parseFloat(req.amount) || 0,
          recipient_info: typeof req.recipient_info === 'string' 
            ? JSON.parse(req.recipient_info) 
            : req.recipient_info
        }));
        setRequests(parsedRequests);
      }
    } catch (error) {
      console.error('Failed to load payment requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      const response = await fetch(`${API_BASE}/payment_requests.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: selectedRequest.transaction_id,
          status: actionType === 'approve' ? 'approved' : 'rejected',
          admin_notes: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Payment request ${actionType}d successfully`);
        fetchRequests();
        setSelectedRequest(null);
        setActionType(null);
        setAdminNotes('');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert('Failed to process request');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedToday = requests.filter(r => {
    const today = new Date().toDateString();
    return r.status === 'approved' && new Date(r.created_at).toDateString() === today;
  }).length;

  const totalVolume = requests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Requests</h1>
          <p className="text-muted-foreground">Manage MOMO and Crypto payment verification requests</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Globe className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalVolume.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Approved amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedToday}</div>
            <p className="text-xs text-muted-foreground">Processed requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requests.length > 0 
                ? ((requests.filter(r => r.status === 'approved').length / requests.length) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Requests</CardTitle>
          <CardDescription>Review and approve MOMO and Crypto payment verifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No payment requests at the moment.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm">{request.id}</TableCell>
                    <TableCell>
                      <Badge variant={request.transfer_type === 'momo' ? 'default' : 'secondary'}>
                        {request.transfer_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.first_name} {request.last_name}</p>
                        <p className="text-xs text-muted-foreground">{request.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {request.currency} {request.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setActionType(null);
                          }}
                        >
                          View
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType('approve');
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setSelectedRequest(request);
                                setActionType('reject');
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View/Action Dialog - Same as src/pages/admin/PaymentRequests.tsx */}
      <Dialog open={!!selectedRequest} onOpenChange={() => {
        setSelectedRequest(null);
        setActionType(null);
        setAdminNotes('');
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Payment Request' : 
               actionType === 'reject' ? 'Reject Payment Request' : 
               'Payment Request Details'}
            </DialogTitle>
            {actionType === 'reject' && (
              <DialogDescription>
                Please provide a reason for rejection. All fees will be refunded to the user.
              </DialogDescription>
            )}
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <Badge className="mt-1" variant={selectedRequest.transfer_type === 'momo' ? 'default' : 'secondary'}>
                    {selectedRequest.transfer_type.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedRequest.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="font-semibold">{selectedRequest.currency} {selectedRequest.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <Label className="text-sm font-semibold mb-2 block">Recipient Information</Label>
                {selectedRequest.transfer_type === 'momo' && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">MOMO Number</Label>
                      <p className="font-mono">{selectedRequest.recipient_info.momoNumber}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p>{selectedRequest.recipient_info.momoName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Platform Fee</Label>
                      <p>GHS {selectedRequest.recipient_info.platformFee?.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                {selectedRequest.transfer_type === 'crypto' && (
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Cryptocurrency</Label>
                      <p>{selectedRequest.recipient_info.cryptoType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Network</Label>
                      <p>{selectedRequest.recipient_info.networkType}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Wallet Address</Label>
                      <p className="font-mono text-xs break-all">{selectedRequest.recipient_info.walletAddress}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Platform Fee</Label>
                        <p>USD {selectedRequest.recipient_info.platformFee?.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Blockchain Fee</Label>
                        <p>USD {selectedRequest.recipient_info.blockchainFee?.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {actionType && (
                <div>
                  <Label>Admin Notes {actionType === 'reject' && '(Required)'}</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder={actionType === 'reject' ? 'Enter rejection reason...' : 'Optional notes...'}
                    required={actionType === 'reject'}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedRequest(null);
              setActionType(null);
              setAdminNotes('');
            }}>
              {actionType ? 'Cancel' : 'Close'}
            </Button>
            {actionType && (
              <Button 
                onClick={handleAction}
                disabled={actionType === 'reject' && !adminNotes.trim()}
                variant={actionType === 'approve' ? 'default' : 'destructive'}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}