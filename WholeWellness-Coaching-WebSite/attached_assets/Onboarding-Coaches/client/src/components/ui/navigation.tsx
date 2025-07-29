import { Link, useLocation } from "wouter";
import { Star, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoPath from "@assets/star_wwc_logo_1751980969593.jpg";

export default function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/applications", label: "Applications" },
    { href: "/apply", label: "Apply Now" },
  ];

  return (
    <header className="wellness-gradient shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
              <img 
                src={logoPath} 
                alt="Whole Wellness Coaching" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white">
              <h1 className="text-xl font-semibold">Whole Wellness Coaching</h1>
              <p className="text-sm opacity-90">Coach Corner</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-white hover:text-blue-100 transition-colors ${
                  location === item.href ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Profile & Mobile Menu */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--wellness-teal)]" />
            </div>
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-white hover:bg-white/10">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                        location === item.href ? "bg-blue-50 text-blue-600 font-semibold" : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
