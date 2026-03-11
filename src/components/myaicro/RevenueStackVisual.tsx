import { motion } from 'framer-motion';
import { Brain, Database, Search, Send, Zap } from 'lucide-react';

const layers = [
  {
    label: 'Revenue Intelligence Layer',
    tools: 'MyaiCRO',
    icon: Brain,
    highlight: true,
  },
  {
    label: 'CRM Layer',
    tools: 'HubSpot / Zoho / MyaiCRO',
    icon: Database,
  },
  {
    label: 'Prospecting Layer',
    tools: 'Apollo / Clay / ZoomInfo',
    icon: Search,
  },
  {
    label: 'Outreach Layer',
    tools: 'Instantly / Lemlist',
    icon: Send,
  },
  {
    label: 'Automation Layer',
    tools: 'Zapier / Make / Manus',
    icon: Zap,
  },
];

const dataParticles = [
  { delay: 0, x: '20%' },
  { delay: 1.2, x: '50%' },
  { delay: 2.4, x: '75%' },
  { delay: 0.6, x: '35%' },
  { delay: 1.8, x: '60%' },
];

export const RevenueStackVisual = () => {
  return (
    <div className="relative">
      {/* Animated glow behind the stack */}
      <motion.div
        className="absolute -inset-8 rounded-3xl"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.12), transparent 70%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Orbiting ring */}
      <motion.div
        className="absolute -inset-6 rounded-3xl border border-primary/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative flex flex-col gap-3">
        {/* Data flow particles — travel upward toward the intelligence layer */}
        {dataParticles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
            style={{ left: p.x }}
            initial={{ bottom: -10, opacity: 0 }}
            animate={{
              bottom: ['0%', '100%'],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 3,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {layers.map((layer, i) => {
          const Icon = layer.icon;
          return (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.12 * i, type: 'spring', stiffness: 100 }}
              whileHover={{
                scale: 1.03,
                x: layer.highlight ? 0 : 6,
                transition: { duration: 0.2 },
              }}
              className={`
                relative rounded-xl border px-5 py-4 flex items-center gap-4 cursor-default backdrop-blur-sm
                ${layer.highlight
                  ? 'border-primary/60 bg-primary/10 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]'
                  : 'border-border/60 bg-card/60 hover:border-primary/30'}
                transition-colors duration-300
              `}
            >
              {/* Icon with animated pulse for highlight */}
              <motion.div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  layer.highlight
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
                animate={
                  layer.highlight
                    ? { boxShadow: ['0 0 0px hsl(var(--primary) / 0)', '0 0 20px hsl(var(--primary) / 0.4)', '0 0 0px hsl(var(--primary) / 0)'] }
                    : {}
                }
                transition={layer.highlight ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                <Icon className="h-5 w-5" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs font-medium uppercase tracking-wider ${
                    layer.highlight ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {layer.label}
                </p>
                <p
                  className={`text-sm font-semibold truncate ${
                    layer.highlight ? 'text-foreground' : 'text-foreground/80'
                  }`}
                >
                  {layer.tools}
                </p>
              </div>

              {layer.highlight && (
                <motion.span
                  className="ml-auto shrink-0 rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  AI Layer
                </motion.span>
              )}

              {/* Connection dot on the left edge */}
              {!layer.highlight && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary/40 border border-primary/30"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 2, delay: 0.3 * i, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Animated connecting line */}
        <div className="absolute left-0 top-[3.5rem] bottom-[2rem] w-px overflow-hidden">
          <div className="h-full w-full bg-gradient-to-b from-primary/50 via-border/40 to-border/20" />
          <motion.div
            className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-primary/80 to-transparent"
            animate={{ top: ['-2rem', 'calc(100% + 2rem)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
          />
        </div>
      </div>
    </div>
  );
};
