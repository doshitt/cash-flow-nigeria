import { ArrowLeft, ChevronRight, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const profileSections = [
  {
    title: "Account",
    items: [
      { label: "Verification", hasChevron: true },
      { label: "Notification", hasChevron: true }
    ]
  },
  {
    title: "Finance",
    items: [
      { label: "Cards and Banks", hasChevron: true },
      { label: "Transaction Limits", hasChevron: true }
    ]
  },
  {
    title: "Security",
    items: [
      { label: "Password", hasChevron: true },
      { label: "Two facts Authentication", hasChevron: true },
      { label: "Account pin", hasChevron: true },
      { label: "Biometric Login", hasChevron: true }
    ]
  },
  {
    title: "Others",
    items: [
      { label: "Live chats", hasChevron: true },
      { label: "Referral and earn", hasChevron: true },
      { label: "Language", hasChevron: true }
    ]
  }
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fullName = user ? (user.full_name || `${user.first_name} ${user.last_name}`.trim()) : "";
  const initials = fullName ? fullName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U';

  const handleNavigateToSection = (label: string) => {
    switch (label) {
      case "Transaction Limits":
        navigate("/transaction-limits");
        break;
      case "Password":
        navigate("/change-password");
        break;
      case "Notification":
        navigate("/notifications");
        break;
      case "Account pin":
        navigate("/account-pin");
        break;
      case "Cards and Banks":
        navigate("/cards-and-banks");
        break;
      case "Referral and earn":
        navigate("/refer-and-earn");
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto relative">
      {/* Status bar simulation */}
      <div className="flex items-center justify-between px-4 py-2 text-sm font-medium">
        <span>9:27</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-foreground rounded-full"></div>
            <div className="w-1 h-3 bg-muted-foreground rounded-full"></div>
          </div>
          <span className="ml-2">📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-6">
        <Button variant="ghost" size="sm" className="p-1" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold">My Profile</h1>
        <div className="w-8" />
      </div>

      <div className="px-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-muted/30 rounded-2xl p-6 relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 right-4 p-1"
          >
            <Edit size={16} />
          </Button>
          
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarImage src={undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-semibold mb-1">{fullName || '—'}</h2>
            <p className="text-muted-foreground text-sm mb-2">{user?.email || '—'}</p>
            
            {user?.is_verified ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                ✓ Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                Unverified
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-6">
          {profileSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-3">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    onClick={() => handleNavigateToSection(item.label)}
                    className="flex items-center justify-between w-full p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium">{item.label}</span>
                    {item.hasChevron && <ChevronRight size={16} className="text-muted-foreground" />}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout Section */}
        <div className="pt-6 space-y-3">
          <button className="w-full p-4 text-center font-medium" onClick={() => { logout(); navigate('/login'); }}>
            Log out
          </button>
          <button className="w-full p-4 text-center font-medium text-destructive">
            Delete Account
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;