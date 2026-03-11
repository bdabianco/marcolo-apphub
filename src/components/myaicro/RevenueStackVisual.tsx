import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Brain,
  Users,
  Mail,
  GitBranch,
  MessageSquare,
  AlertTriangle,
  TrendingDown,
  Target,
  Gauge,
  Crosshair,
  BarChart3,
  Zap,
  Activity,
  Shield,
  ListChecks,
} from 'lucide-react';

/* ── Data ── */

const inputSignals = [
  { icon: Users, label: 'Lead Data', sub: 'Enrichment & research' },
  { icon: Mail, label: 'Sales Activity', sub: 'Emails, calls, LinkedIn' },
  { icon: GitBranch, label: 'Pipeline Events', sub: 'Stage movement' },
  { icon: MessageSquare, label: 'Engagement', sub: 'Replies & meetings' },
];

const analysisInsights = [
  { icon: AlertTriangle, label: 'Deal Risk Detected', color: 'text-amber-400' },
  { icon: TrendingDown, label: 'Pipeline Coverage Gap', color: 'text-amber-400' },
  { icon: Target, label: 'High Probability Opportunity', color: 'text-primary' },
  { icon: Gauge, label: 'Sales Velocity Decline', color: 'text-amber-400' },
];

const outputActions = [
  { icon: Crosshair, label: 'Next Best Action', sub: 'Follow up with 7 warm prospects' },
  { icon: AlertTriangle, label: 'Pipeline Alert', sub: 'Coverage below target' },
  { icon: BarChart3, label: 'Revenue Forecast', sub: 'Projected quarterly revenue' },
  { icon: Zap, label: 'Execution Plan', sub: 'Increase outbound to SaaS' },
];

const dashboardMetrics = [
  { label: 'Pipeline Health', value: '87%', icon: Activity, accent: true },
  { label: 'Forecast Confidence', value: '92%', icon: BarChart3, accent: true },
  { label: 'Deal Alerts', value: '3', icon: Shield, accent: false },
  { label: 'Execution Plan', value: 'Active', icon: ListChecks, accent: true },
];

/* ── Animation phases ── */
// 0: inputs flow in  (0–1.5s)
// 1: engine processing (1.5–3s)
// 2: outputs appear   (3–4.5s)
// 3: dashboard state   (4.5–8s then loop)

export const RevenueStackVisual = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 2750),
      setTimeout(() => setPhase(2), 5500),
      setTimeout(() => setPhase(3), 8250),
      setTimeout(() => setPhase(0), 14000),
    ];
    const loop = setInterval(() => {
      setPhase(0);
      setTimeout(() => setPhase(1), 2750);
      setTimeout(() => setPhase(2), 5500);
      setTimeout(() => setPhase(3), 8250);
    }, 14000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  return (
    <div className="relative select-none">
      {/* Background glow */}
      <motion.div
        className="absolute -inset-8 rounded-3xl"
        style={{
          background:
            'radial-gradient(ellipse at center, hsl(var(--primary) / 0.1), transparent 70%)',
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/30 bg-muted/20">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground/80 uppercase tracking-wider">
              MyaiCRO Intelligence System
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-medium uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>

        {/* 3-column flow layout */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-0 p-4 min-h-[320px]">
          {/* ── COLUMN 1: Input Signals ── */}
          <div className="flex flex-col gap-2 justify-center">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 text-center">
              Input Signals
            </p>
            {inputSignals.map((sig, i) => (
              <motion.div
                key={sig.label}
                initial={{ opacity: 0, x: -30 }}
                animate={
                  phase >= 0
                    ? { opacity: 1, x: 0 }
                    : { opacity: 0, x: -30 }
                }
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="flex items-center gap-2 rounded-lg border border-border/30 bg-muted/20 px-3 py-2"
              >
                <sig.icon className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-foreground/90 leading-tight truncate">
                    {sig.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-tight truncate">
                    {sig.sub}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── COLUMN 2: Central Engine ── */}
          <div className="flex flex-col items-center justify-center px-3 relative">
            {/* Flow lines left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={`fl-${i}`}
                  className="h-px bg-primary/40 mb-[26px] last:mb-0"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  style={{ transformOrigin: 'left' }}
                />
              ))}
            </div>

            {/* Flow lines right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={`fr-${i}`}
                  className="h-px bg-primary/40 mb-[26px] last:mb-0"
                  initial={{ scaleX: 0 }}
                  animate={phase >= 2 ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  style={{ transformOrigin: 'right' }}
                />
              ))}
            </div>

            {/* Engine box */}
            <motion.div
              className="relative rounded-xl border-2 border-primary/40 bg-primary/5 backdrop-blur-sm px-4 py-3 w-[140px]"
              animate={
                phase === 1
                  ? {
                      borderColor: [
                        'hsl(160 70% 50% / 0.4)',
                        'hsl(160 70% 50% / 0.8)',
                        'hsl(160 70% 50% / 0.4)',
                      ],
                      boxShadow: [
                        '0 0 0px hsl(160 70% 50% / 0)',
                        '0 0 30px hsl(160 70% 50% / 0.3)',
                        '0 0 0px hsl(160 70% 50% / 0)',
                      ],
                    }
                  : {}
              }
              transition={{ duration: 1.5, repeat: phase === 1 ? Infinity : 0, ease: 'easeInOut' }}
            >
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
                  animate={phase === 1 ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 2, repeat: phase === 1 ? Infinity : 0, ease: 'linear' }}
                >
                  <Brain className="h-4 w-4 text-primary-foreground" />
                </motion.div>
                <p className="text-[9px] font-bold text-primary text-center uppercase tracking-wider leading-tight">
                  MyaiCRO
                  <br />
                  Engine
                </p>
              </div>

              {/* Analysis insights cycling inside engine */}
              <AnimatePresence mode="wait">
                {phase >= 1 && phase < 3 && (
                  <AnalysisInsightCycle />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ── COLUMN 3: Outputs / Dashboard ── */}
          <div className="flex flex-col gap-2 justify-center">
            <AnimatePresence mode="wait">
              {phase < 3 ? (
                <motion.div
                  key="outputs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold mb-1 text-center">
                    Revenue Outputs
                  </p>
                  {outputActions.map((out, i) => (
                    <motion.div
                      key={out.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={
                        phase >= 2
                          ? { opacity: 1, x: 0 }
                          : { opacity: 0, x: 30 }
                      }
                      transition={{ duration: 0.4, delay: i * 0.15 }}
                      className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"
                    >
                      <out.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-foreground/90 leading-tight truncate">
                          {out.label}
                        </p>
                        <p className="text-[9px] text-muted-foreground leading-tight truncate">
                          {out.sub}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-2"
                >
                  <p className="text-[9px] uppercase tracking-widest text-primary font-semibold mb-1 text-center">
                    Revenue Dashboard
                  </p>
                  {dashboardMetrics.map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/8 px-3 py-2"
                    >
                      <m.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] text-muted-foreground leading-tight">
                          {m.label}
                        </p>
                        <p
                          className={`text-sm font-bold leading-tight ${
                            m.accent ? 'text-primary' : 'text-amber-400'
                          }`}
                        >
                          {m.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Phase indicator dots */}
        <div className="flex items-center justify-center gap-2 pb-3">
          {['Signals', 'Analysis', 'Outputs', 'Dashboard'].map((lbl, i) => (
            <div key={lbl} className="flex items-center gap-1">
              <motion.div
                className={`h-1.5 rounded-full transition-colors duration-300 ${
                  phase >= i ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
                animate={{ width: phase === i ? 20 : 6 }}
                transition={{ duration: 0.3 }}
              />
              <span
                className={`text-[8px] uppercase tracking-wider transition-colors duration-300 ${
                  phase >= i ? 'text-primary' : 'text-muted-foreground/40'
                }`}
              >
                {lbl}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Sub-component: cycling analysis insights ── */
const AnalysisInsightCycle = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((prev) => (prev + 1) % analysisInsights.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const insight = analysisInsights[idx];
  const Icon = insight.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mt-2 rounded-md border border-primary/20 bg-background/60 px-2 py-1.5"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5"
        >
          <Icon className={`h-3 w-3 shrink-0 ${insight.color}`} />
          <p className={`text-[8px] font-semibold leading-tight ${insight.color}`}>
            {insight.label}
          </p>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
