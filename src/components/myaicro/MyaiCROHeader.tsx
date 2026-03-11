import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';

export const MyaiCROHeader = () => {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/myaicro" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={marcoloLogo} alt="MyaiCRO" className="h-8 w-8" />
          <span className="text-lg font-bold -ml-[9px]">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Myai</span>
            <span className="text-foreground">CRO</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#vision" className="hover:text-foreground transition-colors">Vision</a>
        </nav>

        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => window.open('https://myaicro.marcoloai.com', '_blank')}
        >
          Start Your Free Trial
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
