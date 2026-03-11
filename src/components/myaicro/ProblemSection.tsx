import { motion } from 'framer-motion';
import { AlertTriangle, Clock, BarChart3, Shuffle, Ghost } from 'lucide-react';

const problems = [
  { icon: Ghost, text: 'Pipeline gaps appear too late to recover' },
  { icon: AlertTriangle, text: 'Deals stall without warning or visibility' },
  { icon: Clock, text: 'Follow-ups are inconsistent and manual' },
  { icon: BarChart3, text: 'Forecasting is unreliable and gut-driven' },
  { icon: Shuffle, text: 'Sales activity is fragmented across tools' },
];

export const ProblemSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            The Manual Sales Bottleneck
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Most SMB companies rely on manual processes and disconnected tools to manage revenue.
            The result is missed opportunities, slow execution, and unpredictable growth.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto mb-14">
          {problems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-5"
              >
                <Icon className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/90 leading-relaxed">{item.text}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-muted-foreground max-w-2xl mx-auto"
        >
          The real problem is not sales talent — it is the{' '}
          <span className="text-primary font-semibold">lack of revenue intelligence</span>{' '}
          connecting strategy to execution.
        </motion.p>
      </div>
    </section>
  );
};
