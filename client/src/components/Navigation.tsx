import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthForm from "@/components/AuthForm";
import Logo from "@/components/Logo";
import AdminAccess from "@/components/AdminAccess";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Condensed navigation - core items only
const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/ai-coaching", label: "AI Coaching" },
  { href: "/assessments", label: "Assessments" },
  { href: "/digital-onboarding", label: "Get Started" },
];

// Move more items to dropdown to reduce header width
const dropdownItems = [
  { href: "/mental-wellness", label: "Mental Wellness" },
  { href: "/personalized-recommendations", label: "Personal Recommendations" },
  { href: "/subscribe", label: "Premium Access" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/programs", label: "Programs" },
  { href: "/wix-booking", label: "Book Appointment" },
  { href: "/impact", label: "Impact" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
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

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Logo className="h-8 w-8" showText={true} />
            </Link>
          </div>

          {/* Desktop Navigation - Center - Condensed */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-2 py-2 rounded-md transition-colors whitespace-nowrap text-gray-600 hover:text-primary text-[12px] text-center ml-[0px] mr-[0px] pl-[5px] pr-[5px] pt-[6px] pb-[6px] font-bold"
                >
                  {item.label}
                </Link>
              ))}
              
              {/* More Menu Dropdown - Compact */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-2 py-2 text-sm font-medium text-gray-600 hover:text-primary">
                    More
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  {dropdownItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="w-full cursor-pointer">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop Actions - Right - Compact */}
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <AdminAccess />
                <Link href="/donate">
                  <Button variant="outline" className="whitespace-nowrap">
                    Donate
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
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
                    <DropdownMenuItem asChild>
                      <Link href="/user-profile" className="w-full">
                        Profile & Progress
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "coach" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/coach-certifications" className="w-full">
                            Certification Courses
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/certification-dashboard" className="w-full">
                            Certification Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/member-portal" className="w-full">
                        Member Portal
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/booking" className="w-full">
                        Book Session
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/coach-profile" className="w-full">
                        Coach Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="https://wholewellness-coaching.org/wwcchatbot#wwcchatbot" target="_blank" rel="noopener noreferrer" className="w-full">
                        🧪 Beta Test AI Coach
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      Sign In
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <AuthForm />
                  </DialogContent>
                </Dialog>
                <Link href="/digital-onboarding">
                  <Button className="bg-primary text-white hover:bg-secondary">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="mt-6 space-y-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "block px-3 py-2 rounded-md text-base font-medium",
                        location === item.href
                          ? "text-primary"
                          : "text-gray-600 hover:text-primary"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Mobile Dropdown Items */}
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-gray-500 mb-2">More</div>
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "block px-3 py-2 rounded-md text-base font-medium",
                          location === item.href
                            ? "text-primary"
                            : "text-gray-600 hover:text-primary"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="pt-4 space-y-3">
                    {isAuthenticated ? (
                      <>
                        <AdminAccess />
                        <Link href="/donate" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Donate
                          </Button>
                        </Link>
                        <Link href="/member-portal" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            Member Portal
                          </Button>
                        </Link>
                        <Link href="/booking" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            Book Session
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600"
                          onClick={() => {
                            logoutMutation.mutate();
                            setIsOpen(false);
                          }}
                          disabled={logoutMutation.isPending}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              Sign In
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <AuthForm />
                          </DialogContent>
                        </Dialog>
                        <Link href="/booking" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-primary text-white hover:bg-secondary">
                            Get Started
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}