import { ArrowRight } from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';

export const MyaiAppsHeader = () => {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={marcoloLogo} alt="MyaiApps" className="h-8 w-8" />
          <span className="text-lg font-bold">MyaiApps</span>
        </a>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://www.marcoloai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Main Site
            <ArrowRight className="inline ml-1 h-3.5 w-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
};
