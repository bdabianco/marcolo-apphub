import { ArrowRight } from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';

export const MyaiAppsHeader = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-bg-base/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img src={marcoloLogo} alt="MyaiApps" className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight text-text-primary">MyaiApps</span>
        </a>

        <nav className="flex items-center gap-6 text-sm">
          <a
            href="https://myaicro.marcoloai.com/founders-waitlist"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary transition-colors hover:text-text-primary"
          >
            Founders Waitlist
          </a>
          <a
            href="https://www.marcoloai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-text-secondary transition-colors hover:text-text-primary"
          >
            Main Site
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </a>
        </nav>
      </div>
    </header>
  );
};
