import { motion } from 'framer-motion';
import { TrendingUp, MessageSquare, LineChart } from 'lucide-react';

const capabilities = [
  {
    icon: TrendingUp,
    title: 'Pipeline Intelligence',
    points: [
      'Detect pipeline gaps before they become problems',
      'Identify stalled deals that need attention',
      'Analyze deal probability with data-driven scoring',
      'Improve forecast reliability across your funnel',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Sales Execution Insights',
    points: [
      'Analyze outreach performance by channel and message',
      'Identify high-performing messages and sequences',
      'Recommend optimal follow-up timing',
      'Surface opportunities that need immediate action',
    ],
  },
  {
    icon: LineChart,
    title: 'Revenue Forecasting',
    points: [
      'Model revenue projections based on real pipeline data',
      'Analyze sales velocity and conversion trends',
      'Forecast pipeline health with confidence intervals',
    ],
  },
];

export const CapabilitiesSection = () => {
  return (
    <section id="capabilities" className="py-20 lg:py-28 bg-card/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What MyaiCRO Does
          </h2>
          <p className="text-lg text-muted-foreground">
            Three core intelligence modules that transform how your team manages revenue.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-border/60 bg-card p-7"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-4">{cap.title}</h3>
                <ul className="space-y-3">
                  {cap.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
