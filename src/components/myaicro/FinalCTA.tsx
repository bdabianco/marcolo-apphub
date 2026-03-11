import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const FinalCTA = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-3xl mx-auto text-center rounded-2xl border border-primary/30 bg-primary/5 p-10 lg:p-14 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[image:var(--gradient-radial)] opacity-30" />
          <div className="relative z-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Build Your AI Revenue Engine
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto">
              Modern revenue teams rely on intelligent systems — not manual processes — to grow
              predictably. Start by designing the right AI sales stack for your business.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 shadow-[var(--shadow-soft)]"
              onClick={() => window.open('https://myaicro.marcoloai.com', '_blank')}
            >
              Build Your AI Sales Stack
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
