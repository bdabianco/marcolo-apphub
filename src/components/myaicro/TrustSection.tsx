import { motion } from 'framer-motion';

const audiences = [
  'Founders',
  'Small Sales Teams',
  'SaaS Startups',
  'Agencies',
  'B2B Companies',
];

export const TrustSection = () => {
  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="text-xl lg:text-2xl text-foreground font-medium leading-relaxed mb-8">
            Built for teams that want{' '}
            <span className="text-primary">enterprise-level revenue intelligence</span>{' '}
            without enterprise complexity.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {audiences.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm text-muted-foreground"
              >
                {a}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
