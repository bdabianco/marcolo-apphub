import { motion } from 'framer-motion';
import { Search, Send, Database, Brain } from 'lucide-react';

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Generate Leads',
    desc: 'Use prospecting tools like Apollo, Clay, or ZoomInfo to build your target list.',
  },
  {
    num: '02',
    icon: Send,
    title: 'Run Outreach',
    desc: 'Launch campaigns with tools like Instantly or Lemlist to engage prospects.',
  },
  {
    num: '03',
    icon: Database,
    title: 'Track Deals',
    desc: 'Manage your pipeline inside your CRM — HubSpot, Zoho, or any platform you use.',
  },
  {
    num: '04',
    icon: Brain,
    title: 'MyaiCRO Analyzes',
    desc: 'MyaiCRO connects the entire system and surfaces the intelligence your team needs.',
    highlight: true,
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How MyaiCRO Works
          </h2>
          <p className="text-lg text-muted-foreground">
            MyaiCRO does not replace your tools — it connects them with intelligence.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`relative rounded-xl border p-6 text-center ${
                  step.highlight
                    ? 'border-primary/50 bg-primary/5 shadow-[var(--shadow-soft)]'
                    : 'border-border/60 bg-card'
                }`}
              >
                <span className="text-3xl font-bold text-primary/30 mb-3 block">{step.num}</span>
                <div
                  className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                    step.highlight
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
