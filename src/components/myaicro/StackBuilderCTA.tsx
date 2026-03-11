import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
  'Get AI-powered pipeline insights from day one',
  'Identify revenue risks before they cost you deals',
  'Automate follow-ups and next-best actions instantly',
];

export const StackBuilderCTA = () => {
  return (
    <section className="py-20 lg:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Why Start Today?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Every day without AI-driven revenue intelligence is a day of missed opportunities.
            Start your free trial and see the difference in your first week.
          </p>

          <div className="flex flex-col items-center gap-3 mb-10">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-foreground/90">
                <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 shadow-[var(--shadow-soft)]"
            onClick={() => window.open('https://myaicro.marcoloai.com', '_blank')}
          >
            Build Your AI Sales Stack
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
