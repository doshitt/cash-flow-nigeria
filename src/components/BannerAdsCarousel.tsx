import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/config/api";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

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

export const BannerAdsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupBanner, setPopupBanner] = useState<BannerAd | null>(null);

  const { data: banners } = useQuery({
    queryKey: ['active-banners'],
    queryFn: async () => {
      const response = await fetch(getApiUrl('/admin/banner_ads.php'));
      if (!response.ok) return [];
      const data = await response.json();
      if (!data.success) return [];
      
      // Filter active banners
      const now = new Date();
      return (data.data as BannerAd[]).filter(banner => {
        if (banner.status !== 'active') return false;
        if (banner.start_date && new Date(banner.start_date) > now) return false;
        if (banner.end_date && new Date(banner.end_date) < now) return false;
        return true;
      });
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Auto-rotate banners every 5 seconds
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  // Show popup banners on mount
  useEffect(() => {
    if (!banners) return;
    
    const popupBanners = banners.filter(b => b.display_type === 'popup');
    if (popupBanners.length > 0 && !sessionStorage.getItem('popup_shown')) {
      setPopupBanner(popupBanners[0]);
      setShowPopup(true);
      sessionStorage.setItem('popup_shown', 'true');
    }
  }, [banners]);

  const handleBannerClick = (banner: BannerAd) => {
    if (banner.display_type === 'popup') {
      setPopupBanner(banner);
      setShowPopup(true);
    } else if (banner.link_url && banner.display_type === 'url') {
      window.open(banner.link_url, '_blank');
    }
  };

  if (!banners || banners.length === 0) return null;

  const inlineBanners = banners.filter(b => b.display_type === 'inline' || !b.display_type);

  if (inlineBanners.length === 0) return null;

  const currentBanner = inlineBanners[currentIndex % inlineBanners.length];

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer card-shadow border-0 hover:shadow-lg transition-shadow"
        onClick={() => handleBannerClick(currentBanner)}
      >
        <div className="relative">
          <img 
            src={currentBanner.image_url} 
            alt={currentBanner.title}
            className="w-full h-32 object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {inlineBanners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
              {inlineBanners.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-md p-0 gap-0">
          <button
            onClick={() => setShowPopup(false)}
            className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          {popupBanner && (
            <div 
              className="cursor-pointer"
              onClick={() => {
                if (popupBanner.link_url) {
                  window.open(popupBanner.link_url, '_blank');
                }
                setShowPopup(false);
              }}
            >
              <img 
                src={popupBanner.image_url} 
                alt={popupBanner.title}
                className="w-full rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
