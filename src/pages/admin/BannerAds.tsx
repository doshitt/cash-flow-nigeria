import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Image, Plus, Eye, Edit, Trash2, BarChart3, Loader2 } from "lucide-react";
import { getAdminApiUrl } from "@/config/admin-api";
import { useToast } from "@/hooks/use-toast";

interface BannerAd {
  id: number;
  title: string;
  image_url: string;
  link_url: string | null;
  position: string;
  status: string;
  display_type: 'popup' | 'inline' | 'url';
  start_date: string | null;
  end_date: string | null;
}

export default function BannerAds() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    position: 'home',
    status: 'active',
    display_type: 'inline',
    start_date: '',
    end_date: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery({
    queryKey: ['banner-ads'],
    queryFn: async () => {
      const response = await fetch(getAdminApiUrl('/banner_ads.php'));
      if (!response.ok) throw new Error('Failed to fetch banners');
      const data = await response.json();
      return data.data as BannerAd[];
    },
  });

  const createBanner = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(getAdminApiUrl('/banner_ads.php'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create banner');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banner-ads'] });
      toast({ title: "Success", description: "Banner created successfully" });
      setIsDialogOpen(false);
      setFormData({
        title: '',
        image_url: '',
        link_url: '',
        position: 'home',
        status: 'active',
        display_type: 'inline',
        start_date: '',
        end_date: ''
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create banner", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banner Ads</h1>
          <p className="text-muted-foreground">Manage promotional banners on the homepage</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Banner Ad</DialogTitle>
              <DialogDescription>
                Add a new promotional banner to display on the homepage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input 
                  id="title" 
                  placeholder="Banner title" 
                  className="col-span-3"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image_url" className="text-right">Image URL</Label>
                <Input 
                  id="image_url" 
                  placeholder="https://..." 
                  className="col-span-3"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="display_type" className="text-right">Display Type</Label>
                <Select 
                  value={formData.display_type} 
                  onValueChange={(value) => setFormData({...formData, display_type: value as any})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inline">Inline (Carousel)</SelectItem>
                    <SelectItem value="popup">Popup (On page load)</SelectItem>
                    <SelectItem value="url">URL (Click to external page)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link_url" className="text-right">Link URL</Label>
                <Input 
                  id="link_url" 
                  placeholder="https://..." 
                  className="col-span-3"
                  value={formData.link_url}
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date" className="text-right">Start Date</Label>
                <Input 
                  id="start_date" 
                  type="date" 
                  className="col-span-3"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_date" className="text-right">End Date</Label>
                <Input 
                  id="end_date" 
                  type="date" 
                  className="col-span-3"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={() => createBanner.mutate(formData)}
                disabled={createBanner.isPending}
              >
                {createBanner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Banner
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banners</CardTitle>
            <Image className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners?.filter(b => b.status === 'active').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently displayed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <Eye className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{banners?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inline Banners</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners?.filter(b => b.display_type === 'inline').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Carousel display</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popup Banners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {banners?.filter(b => b.display_type === 'popup').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Auto-show on load</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Banner Management</CardTitle>
          <CardDescription>Manage all promotional banners and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners && banners.length > 0 ? (
                banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-8 bg-muted rounded flex items-center justify-center overflow-hidden">
                          <img 
                            src={banner.image_url} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{banner.title}</div>
                          <div className="text-sm text-muted-foreground">#{banner.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <Badge variant="outline">{banner.display_type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(banner.status)}</TableCell>
                    <TableCell>
                      {banner.link_url ? (
                        <a href={banner.link_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate max-w-[100px] block">
                          {banner.link_url}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">No link</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {banner.start_date ? (
                          <>
                            <div>{new Date(banner.start_date).toLocaleDateString()}</div>
                            {banner.end_date && (
                              <div className="text-muted-foreground">
                                to {new Date(banner.end_date).toLocaleDateString()}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Always</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No banner ads found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}