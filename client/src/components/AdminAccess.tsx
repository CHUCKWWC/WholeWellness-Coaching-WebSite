import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Shield, Settings, Users, BarChart3, LogOut } from 'lucide-react';
import { Link } from 'wouter';

export default function AdminAccess() {
  // Check if user has admin access
  const { data: adminAuth } = useQuery({
    queryKey: ['/api/admin/auth/me'],
    retry: false,
    refetchOnWindowFocus: false,
  });

  // If not authenticated as admin, show login button
  if (!adminAuth?.user) {
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
            {adminAuth.user.role === 'super_admin' ? 'Super' : 
             adminAuth.user.role === 'admin' ? 'Admin' : 
             adminAuth.user.role === 'moderator' ? 'Mod' : 'Coach'}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{adminAuth.user.firstName} {adminAuth.user.lastName}</p>
          <p className="text-xs text-muted-foreground">{adminAuth.user.email}</p>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/admin-dashboard" className="flex w-full items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        
        {adminAuth.permissions?.includes('view_users') && (
          <DropdownMenuItem asChild>
            <Link href="/admin-dashboard?tab=users" className="flex w-full items-center">
              <Users className="h-4 w-4 mr-2" />
              User Management
            </Link>
          </DropdownMenuItem>
        )}
        
        {adminAuth.permissions?.includes('system_settings') && (
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
            fetch('/api/admin/auth/logout', { method: 'POST' })
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