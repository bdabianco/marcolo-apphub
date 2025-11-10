import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, Building2, Home, ArrowLeft, Shield } from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AppHeader = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentOrganization } = useOrganization();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a
            href="https://www.marcoloai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={marcoloLogo} alt="Marcolo" className="h-8 w-8" />
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Marcolo App Hub
            </span>
          </a>

          {/* Navigation to Main Site */}
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = 'https://marcoloai.com'}
              className="text-muted-foreground hover:text-foreground"
            >
              <Home className="mr-2 h-4 w-4" />
              Main Site
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = 'https://marcoloai.com#services'}
              className="text-muted-foreground hover:text-foreground"
            >
              Services
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = 'https://marcoloai.com#biz-tools'}
              className="text-muted-foreground hover:text-foreground"
            >
              Biz Tools
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {currentOrganization && (
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{currentOrganization.name}</span>
            </div>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Account</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = 'https://marcoloai.com'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Main Site
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin/requests')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin: App Requests
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
