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

export const RevenueStackVisual = () => {
  return (
    <div className="relative">
      {/* Glow behind the stack */}
      <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />

      <div className="relative flex flex-col gap-3">
        {layers.map((layer, i) => {
          const Icon = layer.icon;
          return (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * i }}
              className={`
                relative rounded-xl border px-5 py-4 flex items-center gap-4
                ${layer.highlight
                  ? 'border-primary/60 bg-primary/10 shadow-[var(--shadow-soft)]'
                  : 'border-border/60 bg-card/80'}
              `}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                  layer.highlight
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
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
                <span className="ml-auto shrink-0 rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  AI Layer
                </span>
              )}
            </motion.div>
          );
        })}

        {/* Connecting line */}
        <div className="absolute left-[2.05rem] top-[3.5rem] bottom-[2rem] w-px bg-gradient-to-b from-primary/50 via-border/40 to-border/20 -z-0" />
      </div>
    </div>
  );
};
