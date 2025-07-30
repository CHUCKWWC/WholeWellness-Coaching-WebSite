import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { RoleBadge } from "@/components/RoleBasedAccess";
import { User, Settings, Crown, Shield, LogOut } from "lucide-react";
import { useLocation } from "wouter";

export default function RoleBasedNavigation() {
  const [, setLocation] = useLocation();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/user");
        return response.json();
      } catch (error) {
        return null;
      }
    },
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      setLocation("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setLocation("/login")}>
          Sign In
        </Button>
        <Button onClick={() => setLocation("/register")}>
          Get Started
        </Button>
      </div>
    );
  }

  const getNavItems = () => {
    const items = [];

    // Base navigation for all authenticated users
    items.push({
      label: "Dashboard",
      href: user.role === "coach" ? "/coach-dashboard" : "/member-portal",
      icon: User
    });

    // Role-specific navigation
    if (user.role === "client_free") {
      items.push({
        label: "AI Coaching",
        href: "/ai-coaching",
        icon: User
      });
      items.push({
        label: "Upgrade to Premium",
        href: "/subscribe",
        icon: Crown
      });
    }

    if (user.role === "client_paid" || user.role === "coach") {
      items.push({
        label: "AI Coaching",
        href: "/ai-coaching",
        icon: User
      });
      items.push({
        label: "Assessments",
        href: "/assessments",
        icon: User
      });
    }

    if (user.role === "coach") {
      items.push({
        label: "Certifications",
        href: "/coach-certifications",
        icon: Crown
      });
      items.push({
        label: "Client Management",
        href: "/coach-portal",
        icon: User
      });
    }

    if (user.role === "admin") {
      items.push({
        label: "Admin Dashboard",
        href: "/admin-dashboard",
        icon: Shield
      });
      items.push({
        label: "Role Management",
        href: "/admin-role-management",
        icon: Settings
      });
      items.push({
        label: "Security",
        href: "/admin-security",
        icon: Shield
      });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="flex items-center gap-4">
      {/* Role-based quick navigation */}
      <nav className="hidden md:flex items-center gap-2">
        {navItems.slice(0, 3).map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.href)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* User menu dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">
              {user.firstName || user.email}
            </span>
            <RoleBadge role={user.role} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">{user.firstName} {user.lastName}</div>
            <div className="text-muted-foreground">{user.email}</div>
          </div>
          <DropdownMenuSeparator />
          
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.href}
                onClick={() => setLocation(item.href)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLocation("/user-profile")}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}