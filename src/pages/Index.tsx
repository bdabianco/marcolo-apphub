import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Brain,
  TrendingUp,
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
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-[image:var(--gradient-radial)] opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-[image:var(--gradient-glow)] opacity-20" />

      {/* ───── HERO ───── */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <motion.a
            href="https://www.marcoloai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <img src={marcoloLogo} alt="Marcolo" className="h-20 w-20 mx-auto" />
          </motion.a>

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
            {/* ── MyaiCRO Card ── */}
            <motion.div
              className="lg:col-span-2 group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              onMouseEnter={() => setCroHovered(true)}
              onMouseLeave={() => setCroHovered(false)}
              onClick={() => navigate('/myaicro')}
            >
              <div className="relative rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-md p-8 lg:p-10 overflow-hidden transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-[var(--shadow-elevation)] group-hover:scale-[1.01]">
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10 grid lg:grid-cols-5 gap-8">
                  {/* Left content – 3 cols */}
                  <div className="lg:col-span-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">MyaiCRO</h3>
                        <p className="text-sm text-primary font-medium">AI Chief Revenue Officer</p>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-foreground/90 mt-5 mb-3">
                      Turn pipeline chaos into predictable revenue.
                    </h4>

                    <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                      MyaiCRO analyzes your entire revenue system — from prospect intelligence to
                      closed deals. It detects pipeline gaps, identifies stalled opportunities, and
                      recommends the next best actions to accelerate revenue.
                    </p>

                    {/* Capabilities */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {[
                        { icon: Target, label: 'Pipeline Intelligence' },
                        { icon: AlertTriangle, label: 'Deal Risk Detection' },
                        { icon: Zap, label: 'Sales Execution Insights' },
                        { icon: TrendingUp, label: 'Revenue Forecasting' },
                      ].map((cap) => (
                        <div key={cap.label} className="flex items-center gap-2 text-sm text-foreground/80">
                          <cap.icon className="h-3.5 w-3.5 text-primary shrink-0" />
                          {cap.label}
                        </div>
                      ))}
                    </div>

                    {/* Hover capabilities */}
                    <AnimatePresence>
                      {crohovered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/50 pt-4 mb-6">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-medium">
                              Additional Capabilities
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {hoverCapabilities.map((cap) => (
                                <div
                                  key={cap.label}
                                  className="flex items-center gap-2 text-sm text-primary/80"
                                >
                                  <cap.icon className="h-3.5 w-3.5 shrink-0" />
                                  {cap.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Impact */}
                    <p className="text-xs text-muted-foreground italic mb-6">
                      Operate with enterprise-level revenue intelligence — without hiring a RevOps
                      team.
                    </p>

                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-base h-12 px-8 shadow-[var(--shadow-soft)]"
                    >
                      Explore MyaiCRO
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>

                  {/* Right – Architecture Visual – 2 cols */}
                  <div className="lg:col-span-2 flex items-center">
                    <div className="w-full space-y-2">
                      {stackLayers.map((layer, i) => (
                        <motion.div
                          key={layer.label}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                          className={`rounded-lg border px-4 py-3 text-center transition-all duration-300 ${
                            layer.isTop
                              ? 'border-primary/40 bg-primary/10 shadow-[var(--shadow-soft)]'
                              : 'border-border/50 bg-muted/30'
                          }`}
                        >
                          <p
                            className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                              layer.isTop ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            {layer.label}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            {layer.tools.join(' • ')}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
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
