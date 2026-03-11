import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const roadmap = [
  'Pipeline diagnostics and health scoring',
  'AI-driven deal analysis and risk detection',
  'Revenue forecasting models with confidence scoring',
  'Automated sales recommendations and next-best actions',
  'Performance insights across teams and reps',
];

export const VisionSection = () => {
  return (
    <section id="vision" className="py-20 lg:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Where MyaiCRO Is Headed
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            MyaiCRO is evolving into a full AI-powered revenue intelligence platform — purpose-built
            for growing companies.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4">
          {roadmap.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-lg border border-border/40 bg-card p-4"
            >
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-foreground/90">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
