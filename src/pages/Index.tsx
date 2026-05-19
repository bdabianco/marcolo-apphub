import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyaiAppsHeader } from '@/components/myaicro/MyaiAppsHeader';
import constellationImg from '@/assets/apphub-vision-constellation.png';
import {
  ArrowRight,
  AlertTriangle,
  Brain,
  Target,
  Zap,
  Users,
  Shield,
  Check,
} from 'lucide-react';

/* ───────── Services ───────── */
const services = [
  {
    eyebrow: 'CORE',
    title: 'Onboarding & Configuration',
    body: 'Get MyaiCRO running for your team. Tenant setup, ICP profile, vertical and region targeting, and basic scoring configuration — ready in days, not weeks.',
    items: [
      'Tenant setup and admin configuration',
      'ICP profile and vertical alignment',
      'Initial scoring rules and signal configuration',
      'Founders Tier feature activation',
    ],
    duration: 'TYPICALLY: 1 WEEK',
  },
  {
    eyebrow: 'STANDARD',
    title: 'Integration & Training',
    body: 'Connect MyaiCRO to your existing stack and train your team to run it. Apollo, ZeroBounce, Stripe, and Google Workspace integrations — plus operator training for your sales leaders.',
    items: [
      'Apollo, ZeroBounce, Stripe integration setup',
      'Google Workspace OAuth and email configuration',
      'Operator and admin user training sessions',
      'Custom nurture campaign templates',
    ],
    duration: 'TYPICALLY: 2–3 WEEKS',
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <MyaiAppsHeader />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative">
        <div className="container mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-24 text-center">
          <div className="mx-auto inline-flex items-center rounded-md border border-white/[0.06] bg-bg-elevated px-3 py-1.5 mb-8">
            <span className="eyebrow">The AI Executive Team</span>
          </div>

          <h1 className="mx-auto max-w-[900px] text-[40px] md:text-[56px] font-bold leading-[1.1] tracking-[-0.02em]">
            Hire AI executives that{' '}
            <span style={{ color: 'hsl(var(--text-accent))' }}>actually</span>{' '}
            run your business.
          </h1>

          <p className="mx-auto mt-6 max-w-[720px] text-[18px] md:text-[20px] leading-[1.6] text-text-primary">
            Each MyaiApp is a specialized AI executive — built to run a domain. Scoring, deciding,
            executing, and recommending the next action your team should take.
          </p>

          <p className="mx-auto mt-4 max-w-[720px] text-[16px] leading-[1.6] text-text-secondary">
            MyaiCRO is your AI Chief Revenue Officer. Live and selling today.
          </p>
        </div>
      </section>

      {/* ═══════════ MyaiCRO — LIVE CARD ═══════════ */}
      <section className="relative">
        <div className="container mx-auto px-6 pb-16">
          <div className="mx-auto max-w-[1100px]">
            <div
              className="relative overflow-hidden rounded-[12px] border bg-bg-elevated p-6 md:p-8 transition-colors"
              style={{ borderColor: 'hsl(var(--accent-base) / 0.3)' }}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow mb-2">AI Executive</p>
                  <h2 className="text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-0.02em]">
                    MyaiCRO
                  </h2>
                  <p className="mt-1 text-[18px] md:text-[20px] font-medium text-text-secondary">
                    AI Chief Revenue Officer
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-[6px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: 'hsl(var(--accent-base))', color: '#08090A' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-bg-base" />
                  Live
                </span>
              </div>

              <p className="mt-4 text-sm font-medium text-text-secondary">
                Sales Operating System <span className="text-text-muted">+</span> Revenue Intelligence
              </p>

              {/* Two-column: Architecture + Alert */}
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                {/* Architecture */}
                <div className="rounded-[12px] border border-white/[0.06] bg-bg-base p-5">
                  <p className="eyebrow mb-4">Architecture</p>
                  <div className="space-y-2">
                    {/* Active layer */}
                    <div
                      className="flex items-center justify-between rounded-[8px] border px-4 py-3"
                      style={{ borderColor: 'hsl(var(--accent-base) / 0.3)', background: 'hsl(var(--accent-base) / 0.06)' }}
                    >
                      <div>
                        <p className="eyebrow" style={{ color: 'hsl(var(--accent-base))' }}>
                          Revenue Intelligence Layer
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-text-primary">
                          MyaiCRO AI Engine
                        </p>
                      </div>
                      <Brain className="h-4 w-4" style={{ color: 'hsl(var(--accent-base))' }} />
                    </div>
                    {/* Other layers */}
                    {[
                      { eyebrow: 'Sales Operating System', tool: 'MyaiCRO', Icon: Target },
                      { eyebrow: 'Outreach Layer', tool: 'Instantly · Lemlist', Icon: Zap },
                      { eyebrow: 'Prospecting Layer', tool: 'Apollo · Clay · ZoomInfo', Icon: Users },
                    ].map(({ eyebrow, tool, Icon }) => (
                      <div
                        key={eyebrow}
                        className="flex items-center justify-between rounded-[8px] border border-white/[0.06] bg-bg-elevated px-4 py-3"
                      >
                        <div>
                          <p className="eyebrow">{eyebrow}</p>
                          <p className="mt-0.5 text-sm font-medium text-text-primary">{tool}</p>
                        </div>
                        <Icon className="h-4 w-4 text-text-muted" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue Intelligence Alert */}
                <div className="rounded-[12px] border border-white/[0.06] bg-bg-base p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                    <p className="eyebrow">Revenue Intelligence Alert</p>
                  </div>
                  <h3 className="text-[20px] md:text-[22px] font-semibold leading-[1.25] tracking-[-0.01em]">
                    Pipeline coverage risk detected.
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[8px] border border-white/[0.06] bg-bg-elevated px-4 py-3">
                      <p className="eyebrow mb-1">Current Coverage</p>
                      <p className="text-[28px] font-bold leading-none" style={{ color: 'hsl(var(--accent-base))' }}>
                        1.9x
                      </p>
                    </div>
                    <div className="rounded-[8px] border border-white/[0.06] bg-bg-elevated px-4 py-3">
                      <p className="eyebrow mb-1">Recommended</p>
                      <p className="text-[28px] font-bold leading-none" style={{ color: 'hsl(var(--accent-base))' }}>
                        3x
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-warning">
                    3 deals likely to stall this week.
                  </p>

                  <div className="mt-4 rounded-[8px] border border-white/[0.06] bg-bg-elevated px-4 py-3">
                    <p className="eyebrow mb-1">Recommended Action</p>
                    <p className="text-sm text-text-primary">
                      Increase outbound prospecting targeting your ICP segment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 flex flex-col gap-4 border-t border-white/[0.06] pt-6 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-text-secondary">
                  Run your entire sales operation with one AI executive.
                </p>
                <a
                  href="https://myaicro.marcoloai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-[6px] px-6 py-3 text-[16px] font-semibold transition-colors"
                  style={{ background: 'hsl(var(--accent-base))', color: '#08090A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--accent-hover))')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--accent-base))')}
                >
                  Explore MyaiCRO
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[3px]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ VISION / THE THESIS ═══════════ */}
      <VisionSection />


      {/* ═══════════ IMPLEMENTATION SERVICES ═══════════ */}
      <section className="relative border-t border-white/[0.06]">
        <div className="container mx-auto px-6 py-20 md:py-32">
          <div className="mx-auto max-w-[1100px]">
            {/* Header */}
            <div className="text-center">
              <p className="eyebrow">Services</p>
              <h2 className="mx-auto mt-4 max-w-[900px] text-[40px] md:text-[56px] font-bold leading-[1.1] tracking-[-0.02em]">
                Get MyaiCRO running.
              </h2>
              <p className="mx-auto mt-6 max-w-[720px] text-[18px] md:text-[20px] leading-[1.6] text-text-secondary">
                Marcolo AI builds AI executives. We also help SMB sales teams get them running.
                Onboarding, configuration, integration, and training — handled by the team that
                built MyaiCRO.
              </p>
            </div>

            {/* Service cards */}
            <div className="mt-16 grid gap-6 lg:grid-cols-2">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="flex flex-col rounded-[12px] border border-white/[0.06] bg-bg-elevated p-6 md:p-8 transition-colors hover:border-white/[0.12]"
                >
                  <p className="eyebrow">{s.eyebrow}</p>
                  <h3 className="mt-3 text-[24px] md:text-[28px] font-semibold leading-[1.25] tracking-[-0.01em]">
                    {s.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.6] text-text-primary">{s.body}</p>
                  <ul className="mt-6 space-y-3">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-text-primary">
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: 'hsl(var(--accent-base))' }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex-1" />
                  <div className="mt-6 border-t border-white/[0.06] pt-4">
                    <p className="eyebrow">{s.duration}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rollout CTA */}
            <div className="mt-20 text-center">
              <h3 className="text-[24px] md:text-[28px] font-semibold leading-[1.25] tracking-[-0.01em]">
                Ready to map your rollout?
              </h3>
              <p className="mx-auto mt-4 max-w-[640px] text-[16px] leading-[1.6] text-text-secondary">
                Every MyaiCRO deployment is different. Start with a 30-minute session to align your
                goals, scope, and integration plan.
              </p>
              <a
                href="https://calendly.com/bruce-marcoloai/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex items-center justify-center gap-2 rounded-[6px] px-7 py-3.5 text-[16px] font-semibold transition-colors"
                style={{ background: 'hsl(var(--accent-base))', color: '#08090A' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--accent-hover))')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--accent-base))')}
              >
                Map your MyaiCRO Rollout
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-[3px]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ ENTERPRISE-GRADE SECURITY ═══════════ */}
      <section className="border-t border-white/[0.06]">
        <div className="container mx-auto max-w-[720px] px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-[6px] border border-white/[0.06] bg-bg-elevated px-3 py-1.5">
            <Shield className="h-4 w-4 text-text-secondary" />
            <span className="eyebrow">Enterprise-Grade Security</span>
          </div>
          <p className="mt-4 text-[16px] leading-[1.6] text-text-secondary">
            All data is protected with enterprise-grade encryption and multi-tenant isolation. Your
            organization's information is secured with Row-Level Security and never shared.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
