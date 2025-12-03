import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu, User, LogOut, ChevronDown, Sparkles, Star, Clock, Search } from "lucide-react";
import SmartSearch from "@/components/SmartSearch";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  getMainNavItems, 
  getDropdownCategories, 
  getUserDropdownItems,
  getQuickAccessItems,
  getWellnessToolsItems,
  getConnectSupportItems,
  type UserRole 
} from "@/config/navigationConfig";

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

export default function SmartNavigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isAdminAuthenticated, adminUser } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Determine user role for navigation
  // Normalize "member" role to "user" for navigation config
  const normalizeRole = (role: string | undefined): UserRole => {
    if (!role) return 'guest';
    if (role === 'member') return 'user';
    return role as UserRole;
  };
  
  const userRole: UserRole = isAdminAuthenticated 
    ? (adminUser?.role === 'super_admin' ? 'super_admin' : 'admin')
    : isAuthenticated 
      ? normalizeRole(user?.role)
      : 'guest';
  
  // Get role-specific navigation items
  const mainNavItems = getMainNavItems(userRole);
  const dropdownCategories = getDropdownCategories(userRole);
  const userDropdownItems = getUserDropdownItems(userRole);
  const quickAccessItems = getQuickAccessItems(userRole);
  const wellnessToolsItems = getWellnessToolsItems(userRole);
  const connectSupportItems = getConnectSupportItems(userRole);

  // Listen for custom search event from keyboard shortcuts
  useEffect(() => {
    const handleOpenSearch = () => setShowSearch(true);
    document.addEventListener('openSearch', handleOpenSearch);
    return () => document.removeEventListener('openSearch', handleOpenSearch);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout", {});
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

  return (
    <TooltipProvider>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Logo />
            </div>

            {/* Desktop Navigation - Only visible for authenticated users */}
            {isAuthenticated && (
              <div className="hidden lg:flex lg:items-center lg:space-x-2">
                {/* Search Button */}
                <Button
                  variant="ghost"
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4" />
                  Search
                </Button>

                {/* Main nav items: Home, Dashboard, Donate */}
                {mainNavItems.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}

                {/* Wellness Tools Dropdown */}
                {wellnessToolsItems.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2" data-testid="dropdown-wellness-tools">
                        Wellness Tools
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      {wellnessToolsItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
                            <span className="text-lg">{item.icon}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && (
                              <Badge className={`text-xs ${item.badgeColor}`}>
                                {item.badge}
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Connect & Support Dropdown */}
                {connectSupportItems.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2" data-testid="dropdown-connect-support">
                        Connect & Support
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      {connectSupportItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                          </DropdownMenuItem>
                        </Link>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* More Dropdown - Only for coach/admin tools */}
                {dropdownCategories.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2" data-testid="dropdown-more">
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
                )}
              </div>
            )}

            {/* User Section */}
            <div className="flex items-center space-x-4">
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
                    
                    {/* Public Profile Link */}
                    {user && (
                      <Link href={user.role === 'coach' ? `/coach/${user.id}` : `/user/${user.id}`}>
                        <DropdownMenuItem className="flex items-center gap-3 cursor-pointer">
                          <span className="text-lg">👁️</span>
                          View My Public Profile
                        </DropdownMenuItem>
                      </Link>
                    )}
                    
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
                <div className="flex items-center">
                  <Link href="/login">
                    <Button className="bg-blue-600 hover:bg-blue-700 h-11 min-h-[48px] touch-target" data-testid="button-sign-in">
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu - Only visible for authenticated users */}
              {isAuthenticated && (
                <div className="lg:hidden">
                  <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <div className="flex flex-col space-y-4 mt-8">
                        {/* Main nav items: Home, Dashboard, Donate */}
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
                        
                        {/* Wellness Tools Section */}
                        {wellnessToolsItems.length > 0 && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">
                              Wellness Tools
                            </h4>
                            {wellnessToolsItems.map((item) => (
                              <Link key={item.href} href={item.href}>
                                <Button
                                  variant="ghost"
                                  className="w-full justify-start gap-3 mb-1"
                                  onClick={() => setIsOpen(false)}
                                >
                                  <span>{item.icon}</span>
                                  <span className="flex-1">{item.label}</span>
                                  {item.badge && (
                                    <Badge className={`text-xs ${item.badgeColor}`}>
                                      {item.badge}
                                    </Badge>
                                  )}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        )}
                        
                        {/* Connect & Support Section */}
                        {connectSupportItems.length > 0 && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="text-sm font-semibold text-gray-500 mb-2">
                              Connect & Support
                            </h4>
                            {connectSupportItems.map((item) => (
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
                        )}
                        
                        {/* Coach/Admin Tools Section */}
                        {dropdownCategories.length > 0 && (
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
                          </div>
                        )}
                        
                        {/* Admin Dashboard Access in Mobile - Only show to authenticated admin users */}
                        {isAdminAuthenticated && (
                          <div className="border-t pt-4 mt-4">
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
                    </SheetContent>
                  </Sheet>
                </div>
              )}


            </div>
          </div>
        </div>
        
        {/* Quick Access Navigation - Mobile Only - Hidden for anonymous users */}
        {isAuthenticated && (
          <div className="lg:hidden border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 px-4 py-3 min-w-max">
                {quickAccessItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                        location === item.href 
                          ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" 
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      )}
                      data-testid={`chip-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.icon && <span className="text-base">{item.icon}</span>}
                      {item.label}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Smart Search Modal */}
      <SmartSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </TooltipProvider>
  );
}