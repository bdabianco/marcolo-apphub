import { motion } from 'framer-motion';
import { Building2, Users, Brain } from 'lucide-react';

export const CategorySection = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            The Rise of the AI Chief Revenue Officer
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Enterprise companies invest heavily in RevOps teams, data science, and analytics to
            manage revenue performance. SMB companies deserve the same capability — without the
            overhead.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: Building2,
              title: 'Enterprise RevOps',
              desc: 'Large companies rely on dedicated teams, analysts, and complex tooling to manage revenue systems and forecast growth.',
            },
            {
              icon: Users,
              title: 'The SMB Gap',
              desc: 'Small and mid-market teams lack the resources for dedicated revenue operations, leaving growth decisions to intuition.',
            },
            {
              icon: Brain,
              title: 'MyaiCRO Bridges It',
              desc: 'MyaiCRO continuously analyzes your sales data and surfaces the insights your team needs to execute with precision.',
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="rounded-xl border border-border/60 bg-card p-7 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
