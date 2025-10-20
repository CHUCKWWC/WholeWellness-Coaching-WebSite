import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu, User, LogOut, ChevronDown, Sparkles, Star, Clock, Search } from "lucide-react";
import SmartSearch from "@/components/SmartSearch";
import { SafetyExit } from "@/components/SafetyExit";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import Logo from "@/components/Logo";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Simplified core navigation
const mainNavItems = [
  { 
    href: "/", 
    label: "Home", 
    tooltip: "Your wellness dashboard and starting point" 
  },
  { 
    href: "/ai-coaching", 
    label: "AI Coaching", 
    tooltip: "Instant support from 6 specialized AI coaches",
    badge: "Popular",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  { 
    href: "/wellness-journey", 
    label: "Wellness Journey", 
    tooltip: "Personalized plans, goal tracking, and AI insights",
    badge: "New",
    badgeColor: "bg-green-100 text-green-700"
  },
  { 
    href: "/assessments", 
    label: "Assessments", 
    tooltip: "Discover your wellness needs with comprehensive evaluations" 
  },
  { 
    href: "/donate", 
    label: "Donate", 
    tooltip: "Support our mission to provide life-changing coaching",
    badge: "❤️",
    badgeColor: "bg-red-100 text-red-700"
  }
];

// Organized dropdown items by category
const dropdownCategories = [
  {
    title: "Professional Development",
    items: [
      { href: "/coach-certifications", label: "Certification Courses", icon: "🎓" },
      { href: "/coach-signup", label: "Become a Coach", icon: "👩‍🏫" },
      { href: "/coach-login", label: "Coach Sign In", icon: "🔑" }
    ]
  },
  {
    title: "Wellness Tools",
    items: [
      { href: "/personalized-recommendations", label: "Personal Recommendations", icon: "⭐" },
      { href: "/mental-wellness", label: "Mental Wellness", icon: "🧠" },
      { href: "/resources", label: "Resources", icon: "📚" }
    ]
  },
  {
    title: "Connect & Support",
    items: [
      { href: "/events", label: "Coming Events", icon: "📆" },
      { href: "/wix-booking", label: "Book Appointment", icon: "📅" },
      { href: "/contact", label: "Contact", icon: "💬" },
      { href: "/about", label: "About", icon: "ℹ️" }
    ]
  }
];

// User dropdown items for authenticated users
const userDropdownItems = [
  { href: "/user-profile", label: "Profile & Settings", icon: "👤" },
  { href: "/coach-certifications", label: "Certification Courses", icon: "🎓" },
  { href: "/subscribe", label: "Premium Access", icon: "💎" }
];

export default function SmartNavigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isAdminAuthenticated, adminUser } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Listen for custom search event from keyboard shortcuts
  useEffect(() => {
    const handleOpenSearch = () => setShowSearch(true);
    document.addEventListener('openSearch', handleOpenSearch);
    return () => document.removeEventListener('openSearch', handleOpenSearch);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      // Clear auth session flag
      sessionStorage.removeItem('hasAuthSession');
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: "There was an error logging you out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const NavLink = ({ href, label, tooltip, badge, badgeColor }: any) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href}>
            <Button
              variant={location === href ? "default" : "ghost"}
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                location === href 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "hover:bg-blue-50 hover:text-blue-700"
              )}
            >
              {label}
              {badge && (
                <Badge className={`text-xs ml-1 ${badgeColor}`}>
                  {badge}
                </Badge>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Quick access navigation for mobile
  const quickAccessItems = [
    { href: "/ai-coaching", label: "AI Coaching", icon: "🤖", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { href: "/wellness-journey", label: "Wellness Journey", icon: "🎯", color: "bg-green-50 text-green-700 border-green-200" },
    { href: "/assessments", label: "Assessments", icon: "📋", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { href: "/wix-booking", label: "Book Session", icon: "📅", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { href: "/resources", label: "Resources", icon: "📚", color: "bg-teal-50 text-teal-700 border-teal-200" },
  ];

  return (
    <TooltipProvider>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>

              {mainNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}

              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    More
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {dropdownCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {category.title}
                      </DropdownMenuLabel>
                      {category.items.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                          </DropdownMenuItem>
                        </Link>
                      ))}
                      {categoryIndex < dropdownCategories.length - 1 && <DropdownMenuSeparator />}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {/* Safety Exit Button - Desktop */}
              <div className="hidden md:block">
                <SafetyExit showButton={true} />
              </div>

              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user?.firstName || 'User'}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {userDropdownItems.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
                          <span className="text-lg">{item.icon}</span>
                          {item.label}
                        </DropdownMenuItem>
                      </Link>
                    ))}
                    
                    {/* Admin Dashboard Access - Only show to authenticated admin users */}
                    {isAdminAuthenticated && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href="/admin-dashboard">
                          <DropdownMenuItem className="flex items-center gap-3 cursor-pointer text-blue-600">
                            <span className="text-lg">🛡️</span>
                            Admin Dashboard
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      className="flex items-center gap-3 cursor-pointer text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Create Account
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu */}
              <div className="lg:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <div className="flex flex-col space-y-4 mt-8">
                      {mainNavItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant={location === item.href ? "default" : "ghost"}
                            className="w-full justify-start gap-3"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.label}
                            {item.badge && (
                              <Badge className={`text-xs ml-auto ${item.badgeColor}`}>
                                {item.badge}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      ))}
                      
                      <div className="border-t pt-4 mt-4">
                        {dropdownCategories.map((category) => (
                          <div key={category.title} className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">
                              {category.title}
                            </h4>
                            {category.items.map((item) => (
                              <Link key={item.href} href={item.href}>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start gap-3 mb-1"
                                  onClick={() => setIsOpen(false)}
                                >
                                  <span>{item.icon}</span>
                                  {item.label}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        ))}
                        
                        {/* Admin Dashboard Access in Mobile - Only show to authenticated admin users */}
                        {isAdminAuthenticated && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">
                              Administration
                            </h4>
                            <Link href="/admin-dashboard">
                              <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 mb-1 text-blue-600"
                                onClick={() => setIsOpen(false)}
                              >
                                <span>🛡️</span>
                                Admin Dashboard
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>


            </div>
          </div>
        </div>
        
        {/* Quick Access Navigation - Mobile Only */}
        <div className="lg:hidden border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 py-3 min-w-max">
              {quickAccessItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                      location === item.href 
                        ? item.color + " shadow-sm" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    )}
                    data-testid={`chip-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Smart Search Modal */}
      <SmartSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </TooltipProvider>
  );
}