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

// Helper function to get role-appropriate dashboard href
export const getDashboardHref = (role: UserRole): string => {
  const dashboardRoutes: Record<UserRole, string> = {
    guest: '/login',
    user: '/member-portal',
    coach: '/coach-dashboard',
    admin: '/admin-dashboard',
    super_admin: '/admin-dashboard'
  };
  return dashboardRoutes[role] || '/member-portal';
};

// Main navigation items - ONLY visible to authenticated users
// Guests see only the Sign In button (no navigation menu)
export const getMainNavItems = (role: UserRole): NavItem[] => {
  // Guests get no main nav items - they only see Sign In button
  if (role === 'guest') {
    return [];
  }

  const dashboardHref = getDashboardHref(role);
  
  const allItems: NavItem[] = [
    { 
      href: "/", 
      label: "Home", 
      tooltip: "Your wellness dashboard and starting point",
      roles: ['user', 'coach', 'admin', 'super_admin']
    },
    { 
      href: dashboardHref, 
      label: "Dashboard", 
      tooltip: "Access your personalized dashboard",
      roles: ['user', 'coach', 'admin', 'super_admin']
    },
    { 
      href: "/donate", 
      label: "Donate", 
      tooltip: "Support our mission to provide life-changing coaching",
      badge: "❤️",
      badgeColor: "bg-red-100 text-red-700",
      roles: ['user'] // Only show donate to regular users, not coaches/admins
    },
  ];

  return allItems.filter(item => !item.roles || item.roles.includes(role));
};

// Wellness Tools dropdown - includes AI Coaching, Assessments, and wellness features
export const getWellnessToolsItems = (role: UserRole): NavItem[] => {
  // No wellness tools for guests - they only see Sign In button
  if (role === 'guest') {
    return [];
  }

  const items: NavItem[] = [
    { href: "/ai-coaching", label: "AI Coaching", icon: "🤖", badge: "Popular", badgeColor: "bg-blue-100 text-blue-700" },
    { href: "/assessments", label: "Assessments", icon: "📋" },
    { href: "/wellness-journey", label: "Wellness Journey", icon: "🎯", badge: "New", badgeColor: "bg-green-100 text-green-700" },
    { href: "/mental-wellness-hub", label: "Mental Wellness", icon: "🧠" },
    { href: "/resources", label: "Resources", icon: "📚" },
  ];

  return items;
};

// Connect & Support dropdown - includes coaching, events, and contact options
export const getConnectSupportItems = (role: UserRole): NavItem[] => {
  // No connect/support items for guests - they only see Sign In button
  if (role === 'guest') {
    return [];
  }

  const allItems: NavItem[] = [
    { href: "/coaches", label: "Find a Coach", icon: "👨‍🏫", roles: ['user'] },
    { href: "/tutorial", label: "How to Use Site", icon: "📖" },
    { href: "/events", label: "Upcoming Events", icon: "📆" },
    { href: "/booking", label: "Book Appointment", icon: "📅", roles: ['user'] },
    { href: "/contact", label: "Contact Us", icon: "💬" },
    { href: "/about", label: "About Us", icon: "ℹ️" },
    { href: "/coach-certifications", label: "Become a Coach", icon: "🎓", roles: ['user'] },
  ];

  return allItems.filter(item => !item.roles || item.roles.includes(role));
};

// Dropdown navigation categories (for legacy "More" menu if needed)
export const getDropdownCategories = (role: UserRole): NavCategory[] => {
  // Guests get no dropdown categories
  if (role === 'guest') {
    return [];
  }

  const allCategories: NavCategory[] = [
    {
      title: "Coach Tools",
      roles: ['coach', 'admin', 'super_admin'],
      items: [
        { href: "/coach-dashboard", label: "Coach Dashboard", icon: "📊", roles: ['coach', 'admin', 'super_admin'] },
        { href: "/coach-availability", label: "My Availability", icon: "📅", roles: ['coach', 'admin', 'super_admin'] },
        { href: "/coach-certifications", label: "Certifications", icon: "🎓", roles: ['coach', 'admin', 'super_admin'] },
        { href: "/coach-tutorial", label: "Coach Training", icon: "🎓", roles: ['coach', 'admin', 'super_admin'] }
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
    { href: "/coaches", label: "Find Coaches", icon: "👨‍🏫" },
    { href: "/donate", label: "Support Us", icon: "❤️" }
  ];

  const userItems: NavItem[] = [
    { href: "/member-dashboard", label: "Dashboard", icon: "📊" },
    { href: "/ai-coaching", label: "AI Coaching", icon: "🤖" },
    { href: "/wellness-journey", label: "My Journey", icon: "🎯" },
    { href: "/booking", label: "Book Session", icon: "📅" },
    { href: "/assessments", label: "Assessments", icon: "📋" }
  ];

  const coachItems: NavItem[] = [
    { href: "/coach-dashboard", label: "Dashboard", icon: "📊" },
    { href: "/coach-availability", label: "Availability", icon: "📅" },
    { href: "/coach-certifications", label: "Certifications", icon: "🎓" },
    { href: "/coach-profile", label: "Profile", icon: "👨‍🏫" }
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
