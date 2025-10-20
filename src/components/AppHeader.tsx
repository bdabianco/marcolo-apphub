import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import marcoloLogo from '@/assets/marcolo-logo.png';
import { FileText, TrendingUp, PiggyBank, LineChart, Briefcase } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

export function AppHeader() {
  const { currentProject } = useProject();
  
  const navItems = [
    { to: '/budget', icon: FileText, label: 'Budget' },
    { to: '/cashflow', icon: TrendingUp, label: 'Cashflow' },
    { 
      to: '/savings', 
      icon: currentProject?.project_type === 'business' ? Briefcase : PiggyBank, 
      label: currentProject?.project_type === 'business' ? 'Capital Planning' : 'Savings' 
    },
    { to: '/insights', icon: LineChart, label: 'Insights' },
  ];

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center gap-6 px-4">
        <NavLink to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={marcoloLogo} alt="Marcolo" className="h-8 w-8" />
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mycashflow
          </span>
        </NavLink>

        <nav className="flex items-center gap-1 ml-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
