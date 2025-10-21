import { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: string;
  tooltip?: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  roles?: UserRole[]; // Only show for these roles (undefined = show to all)
}

export interface NavCategory {
  title: string;
  items: NavItem[];
  roles?: UserRole[]; // Only show category for these roles
}

export type UserRole = 'guest' | 'user' | 'coach' | 'admin' | 'super_admin';

// Main navigation items (always visible)
export const getMainNavItems = (role: UserRole): NavItem[] => {
  const allItems: NavItem[] = [
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
      badgeColor: "bg-red-100 text-red-700",
      roles: ['guest', 'user'] // Don't show donate to coaches/admins
    },
  ];

  return allItems.filter(item => !item.roles || item.roles.includes(role));
};

// Dropdown navigation categories
export const getDropdownCategories = (role: UserRole): NavCategory[] => {
  const allCategories: NavCategory[] = [
    {
      title: "Professional Development",
      items: [
        { href: "/coach-certifications", label: "Certification Courses", icon: "🎓" },
        { href: "/coach-signup", label: "Become a Coach", icon: "👩‍🏫", roles: ['guest', 'user'] }
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
        { href: "/wix-booking", label: "Book Appointment", icon: "📅", roles: ['user', 'guest'] },
        { href: "/contact", label: "Contact", icon: "💬" },
        { href: "/about", label: "About", icon: "ℹ️" }
      ]
    },
    {
      title: "Coach Tools",
      roles: ['coach', 'admin', 'super_admin'],
      items: [
        { href: "/coach/clients", label: "My Clients", icon: "👥", roles: ['coach', 'admin', 'super_admin'] },
        { href: "/coach/schedule", label: "Schedule", icon: "📅", roles: ['coach', 'admin', 'super_admin'] },
        { href: "/coach/assessments", label: "Client Assessments", icon: "📊", roles: ['coach', 'admin', 'super_admin'] },
        { href: "/coach/earnings", label: "Earnings", icon: "💰", roles: ['coach'] }
      ]
    },
    {
      title: "Admin Tools",
      roles: ['admin', 'super_admin'],
      items: [
        { href: "/admin-dashboard", label: "Admin Dashboard", icon: "🛡️", roles: ['admin', 'super_admin'] },
        { href: "/admin-certifications", label: "Certifications", icon: "📜", roles: ['admin', 'super_admin'] },
        { href: "/admin-crisis-alerts", label: "Crisis Alerts", icon: "🚨", roles: ['admin', 'super_admin'] },
        { href: "/admin-security", label: "Security", icon: "🔒", roles: ['super_admin'] }
      ]
    }
  ];

  // Filter categories and items based on role
  return allCategories
    .filter(category => !category.roles || category.roles.includes(role))
    .map(category => ({
      ...category,
      items: category.items.filter(item => !item.roles || item.roles.includes(role))
    }))
    .filter(category => category.items.length > 0); // Remove empty categories
};

// User dropdown items (for authenticated users)
export const getUserDropdownItems = (role: UserRole): NavItem[] => {
  const baseItems: NavItem[] = [
    { href: "/user-profile", label: "Profile & Settings", icon: "👤" },
    { href: "/settings", label: "Account Settings", icon: "⚙️" }
  ];

  const roleSpecificItems: Record<UserRole, NavItem[]> = {
    guest: [],
    user: [
      { href: "/member-dashboard", label: "My Dashboard", icon: "📊" },
      { href: "/subscribe", label: "Premium Access", icon: "💎" },
      { href: "/coach-certifications", label: "Become a Coach", icon: "🎓" }
    ],
    coach: [
      { href: "/coach-dashboard", label: "Coach Dashboard", icon: "📊" },
      { href: "/coach-profile", label: "Coach Profile", icon: "👨‍🏫" },
      { href: "/coach/certification", label: "My Certification", icon: "🎓" }
    ],
    admin: [
      { href: "/admin-dashboard", label: "Admin Dashboard", icon: "🛡️" },
      { href: "/coach-dashboard", label: "Coach Dashboard", icon: "📊" }
    ],
    super_admin: [
      { href: "/admin-dashboard", label: "Admin Dashboard", icon: "🛡️" },
      { href: "/coach-dashboard", label: "Coach Dashboard", icon: "📊" }
    ]
  };

  return [...baseItems, ...(roleSpecificItems[role] || [])];
};

// Quick access items for mobile
export const getQuickAccessItems = (role: UserRole): NavItem[] => {
  const guestItems: NavItem[] = [
    { href: "/ai-coaching", label: "AI Coaching", icon: "🤖" },
    { href: "/assessments", label: "Assessments", icon: "📋" },
    { href: "/resources", label: "Resources", icon: "📚" },
    { href: "/donate", label: "Support Us", icon: "❤️" }
  ];

  const userItems: NavItem[] = [
    { href: "/ai-coaching", label: "AI Coaching", icon: "🤖" },
    { href: "/wellness-journey", label: "My Journey", icon: "🎯" },
    { href: "/assessments", label: "Assessments", icon: "📋" },
    { href: "/wix-booking", label: "Book Session", icon: "📅" },
    { href: "/resources", label: "Resources", icon: "📚" }
  ];

  const coachItems: NavItem[] = [
    { href: "/coach-dashboard", label: "Dashboard", icon: "📊" },
    { href: "/coach/clients", label: "Clients", icon: "👥" },
    { href: "/coach/schedule", label: "Schedule", icon: "📅" },
    { href: "/coach-certifications", label: "Courses", icon: "🎓" }
  ];

  const adminItems: NavItem[] = [
    { href: "/admin-dashboard", label: "Dashboard", icon: "🛡️" },
    { href: "/admin-crisis-alerts", label: "Alerts", icon: "🚨" },
    { href: "/admin-certifications", label: "Certs", icon: "📜" },
    { href: "/coach-dashboard", label: "Coach View", icon: "📊" }
  ];

  const itemsByRole: Record<UserRole, NavItem[]> = {
    guest: guestItems,
    user: userItems,
    coach: coachItems,
    admin: adminItems,
    super_admin: adminItems
  };

  return itemsByRole[role] || guestItems;
};

// Get default landing page based on role
export const getDefaultLandingPage = (role: UserRole, hasCompletedOnboarding: boolean): string => {
  if (!hasCompletedOnboarding) {
    return "/digital-onboarding";
  }

  const landingPages: Record<UserRole, string> = {
    guest: "/",
    user: "/member-dashboard",
    coach: "/coach-dashboard",
    admin: "/admin-dashboard",
    super_admin: "/admin-dashboard"
  };

  return landingPages[role] || "/";
};
