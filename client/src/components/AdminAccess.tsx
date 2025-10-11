import { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, Settings, Users, BarChart3, LogOut } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminAccess() {
  // Check if user has admin access (relies on route-based guard in hook)
  const { adminUser, permissions } = useAdminAuth();

  // If not authenticated as admin, show login button
  if (!adminUser) {
    return (
      <Link href="/admin-login">
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Shield className="h-4 w-4 mr-2" />
          Admin Access
        </Button>
      </Link>
    );
  }

  // If authenticated, show admin dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Shield className="h-4 w-4 mr-2" />
          Admin Panel
          <Badge variant="secondary" className="ml-2 text-xs">
            {adminUser.role === 'super_admin' ? 'Super' : 
             adminUser.role === 'admin' ? 'Admin' : 
             adminUser.role === 'moderator' ? 'Mod' : 'Coach'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{adminUser.firstName} {adminUser.lastName}</p>
          <p className="text-xs text-muted-foreground">{adminUser.email}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/admin-dashboard" className="flex w-full items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        
        {permissions?.includes('view_users') && (
          <DropdownMenuItem asChild>
            <Link href="/admin-dashboard?tab=users" className="flex w-full items-center">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Link>
          </DropdownMenuItem>
        )}
        
        {permissions?.includes('system_settings') && (
          <DropdownMenuItem asChild>
            <Link href="/admin-dashboard?tab=settings" className="flex w-full items-center">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Link>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            // Clear admin session flag
            sessionStorage.removeItem('isAdmin');
            fetch('/api/admin/auth/logout', { 
              method: 'POST',
              credentials: 'include'
            })
              .then(() => {
                window.location.reload();
              });
          }}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}