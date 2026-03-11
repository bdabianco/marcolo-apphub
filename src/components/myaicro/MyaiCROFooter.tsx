import marcoloLogo from '@/assets/marcolo-logo.png';

export const MyaiCROFooter = () => {
  return (
    <footer className="border-t border-border/50 py-10">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="/myaicro" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={marcoloLogo} alt="MyaiCRO" className="h-6 w-6" />
          <span className="text-base font-bold">MyaiCRO</span>
        </a>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#vision" className="hover:text-foreground transition-colors">Vision</a>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Marcolo AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
