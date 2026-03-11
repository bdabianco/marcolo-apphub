import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { RevenueStackVisual } from './RevenueStackVisual';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[image:var(--gradient-radial)] opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[image:var(--gradient-glow)] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              A New Category in Revenue Intelligence
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-foreground">Your AI</span>
              <br />
              <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
                Chief Revenue Officer
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-xl">
              Give your sales team the intelligence, insights, and automation used by enterprise revenue teams — without hiring a large RevOps organization.
            </p>

            <p className="text-base text-muted-foreground/80 leading-relaxed mb-8 max-w-xl">
              MyaiCRO analyzes your pipeline, identifies revenue risks, recommends next actions, and helps your team execute a smarter sales system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 shadow-[var(--shadow-soft)]"
                onClick={() => window.open('https://myaicro.marcoloai.com', '_blank')}
              >
                Start Your Free Trial Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 border-border hover:border-primary/50"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Play className="mr-2 h-4 w-4" />
                See How MyaiCRO Works
              </Button>
            </div>
          </motion.div>

          {/* Right: Revenue Stack Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <RevenueStackVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
