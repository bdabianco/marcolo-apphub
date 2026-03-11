import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MyaiAppsHeader } from '@/components/myaicro/MyaiAppsHeader';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Brain,
  DollarSign,
  Settings2,
  Shield,
  Zap,
  Target,
  BarChart3,
  AlertTriangle,
  LineChart,
  Users,
  Activity,
  Lock,
  Rows3,
} from 'lucide-react';
import marcoloLogo from '@/assets/marcolo-logo.png';

/* ───── Architecture Stack Data ───── */
const stackLayers = [
  {
    label: 'Revenue Intelligence',
    tools: ['MyaiCRO'],
    isTop: true,
  },
  {
    label: 'CRM',
    tools: ['HubSpot', 'Zoho'],
  },
  {
    label: 'Outreach',
    tools: ['Instantly', 'Lemlist'],
  },
  {
    label: 'Prospecting',
    tools: ['Apollo', 'Clay', 'ZoomInfo'],
  },
];

/* ───── Hover capabilities ───── */
const hoverCapabilities = [
  { icon: Users, label: 'AI Sales Coaching' },
  { icon: Activity, label: 'Pipeline Health Monitoring' },
  { icon: LineChart, label: 'Revenue Forecast Modeling' },
  { icon: AlertTriangle, label: 'Opportunity Alerts' },
];

const Index = () => {
  const navigate = useNavigate();
  const [crohovered, setCroHovered] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MyaiAppsHeader />
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[image:var(--gradient-radial)] opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[image:var(--gradient-glow)] opacity-20" />

      {/* ───── HERO ───── */}
      <section className="relative z-10 pt-8 pb-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
              <Brain className="h-4 w-4" />
              AI-Powered Executive Systems
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-foreground">Your AI</span>
            <br />
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              Executive Team
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Deploy intelligent AI systems that help you grow revenue, manage finances, and scale
            operations — without hiring a full executive staff.
          </motion.p>

          <motion.p
            className="text-base text-muted-foreground/70 leading-relaxed max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Each MyaiApp acts like a specialized AI executive — continuously analyzing your
            business and recommending smarter decisions.
          </motion.p>
        </div>
      </section>

      {/* ───── APP CARDS ───── */}
      <section className="relative z-10 pb-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-3 max-w-6xl mx-auto">
            {/* ── MyaiCRO Card – Intelligence Preview ── */}
            <motion.div
              className="lg:col-span-2 group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onMouseEnter={() => setCroHovered(true)}
              onMouseLeave={() => setCroHovered(false)}
              onClick={() => navigate('/myaicro')}
            >
              <div className="relative rounded-2xl border border-primary/25 bg-card/50 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_80px_-20px_hsl(160_70%_50%/0.4)] group-hover:scale-[1.015]">
                {/* Ambient glow */}
                <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/8 rounded-full blur-3xl transition-opacity duration-700 opacity-50 group-hover:opacity-100" />
                <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />

                {/* Header bar */}
                <div className="relative z-10 flex items-center justify-between px-8 pt-7 pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-primary/70 font-semibold">AI Executive</p>
                      <h3 className="text-xl font-bold text-foreground leading-tight">MyaiCRO</h3>
                      <p className="text-xs text-muted-foreground font-medium">AI Chief Revenue Officer</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] text-primary font-medium uppercase tracking-wider">Live</span>
                  </div>
                </div>

                {/* Positioning statement */}
                <div className="relative z-10 mx-8 mt-4">
                  <p className="text-sm font-semibold text-primary/90">Sales Operating System + Revenue Intelligence</p>
                </div>

                {/* ── Stack Visualization ── */}
                <div className="relative z-10 mx-8 mt-5 rounded-xl border border-primary/15 bg-background/60 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/40 bg-muted/20">
                    <Rows3 className="h-3.5 w-3.5 text-primary/70" />
                    <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">AI Sales Stack Architecture</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {/* Revenue Intelligence Layer */}
                    <div className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">Revenue Intelligence Layer</p>
                        <p className="text-sm font-bold text-foreground">MyaiCRO AI Engine</p>
                      </div>
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    {/* Sales OS */}
                    <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold">Sales Operating System</p>
                        <p className="text-sm font-bold text-foreground/90">MyaiCRO</p>
                      </div>
                      <Target className="h-4 w-4 text-primary/70" />
                    </div>
                    {/* Outreach */}
                    <div className="rounded-lg bg-muted/30 border border-border/30 px-4 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Outreach Layer</p>
                        <p className="text-xs text-foreground/70">Instantly · Lemlist</p>
                      </div>
                      <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    {/* Prospecting */}
                    <div className="rounded-lg bg-muted/30 border border-border/30 px-4 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prospecting Layer</p>
                        <p className="text-xs text-foreground/70">Apollo · Clay · ZoomInfo</p>
                      </div>
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                {/* ── Insight Preview Panel ── */}
                <div className="relative z-10 mx-8 mt-4 rounded-xl border border-primary/15 bg-background/60 backdrop-blur-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border/40 bg-muted/20">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Revenue Intelligence Alert</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-foreground/80 font-medium">Pipeline coverage risk detected.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/30 border border-border/30 px-4 py-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Current Coverage</p>
                        <p className="text-2xl font-bold text-amber-400">1.9x</p>
                      </div>
                      <div className="rounded-lg bg-muted/30 border border-border/30 px-4 py-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Recommended</p>
                        <p className="text-2xl font-bold text-primary">3x</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-amber-400/5 border border-amber-400/15 px-4 py-2.5">
                      <p className="text-xs text-foreground/70 leading-relaxed">
                        <span className="font-semibold text-amber-400">3 deals</span> likely to stall this week.
                      </p>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/15 px-4 py-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold mb-0.5">Recommended Action</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">Increase outbound prospecting targeting your ICP segment.</p>
                    </div>
                  </div>
                </div>

                {/* ── Hover Capabilities ── */}
                <AnimatePresence>
                  {crohovered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden relative z-10"
                    >
                      <div className="mx-8 mt-4 grid grid-cols-2 gap-2">
                        {hoverCapabilities.map((cap) => (
                          <div
                            key={cap.label}
                            className="flex items-center gap-2 rounded-lg bg-muted/20 border border-border/30 px-3 py-2 text-xs text-primary/90"
                          >
                            <cap.icon className="h-3.5 w-3.5 shrink-0" />
                            {cap.label}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Footer ── */}
                <div className="relative z-10 px-8 pt-5 pb-7 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground italic max-w-xs">
                    Run your entire sales operation with AI-powered intelligence.
                  </p>
                  <Button
                    size="default"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-soft)]"
                  >
                    Explore MyaiCRO
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* ── Future Cards Column ── */}
            <div className="flex flex-col gap-6">
              {/* MyaiCFO */}
              <motion.div
                className="relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-7 overflow-hidden opacity-70"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <DollarSign className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">MyaiCFO</h3>
                      <p className="text-sm text-secondary font-medium">AI Chief Financial Officer</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Financial intelligence platform for SMB companies. Real-time cash flow insights,
                    budgeting, and strategic financial guidance.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary bg-secondary/10 border border-secondary/20 rounded-full px-3 py-1">
                    <Lock className="h-3 w-3" />
                    Coming Soon
                  </span>
                </div>
              </motion.div>

              {/* MyaiCOO */}
              <motion.div
                className="relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-7 overflow-hidden opacity-70"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.7, y: 0 }}
                transition={{ duration: 0.6, delay: 0.85 }}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/5 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      <Settings2 className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">MyaiCOO</h3>
                      <p className="text-sm text-accent font-medium">AI Chief Operations Officer</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Operational intelligence for scaling organizations. Workflow automation, resource
                    optimization, and performance analytics.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                    <Lock className="h-3 w-3" />
                    Coming Soon
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── TRUST FOOTER ───── */}
      <section className="relative z-10 border-t border-border/30 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Enterprise-Grade Security</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All data is protected with enterprise-grade encryption and multi-tenant isolation. Your
            organization's information is secured with Row-Level Security and never shared.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
