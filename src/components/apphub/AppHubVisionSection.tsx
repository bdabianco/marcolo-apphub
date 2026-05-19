import { useState, type FormEvent } from 'react';
import constellationImg from '@/assets/apphub-vision-constellation.png';

export const AppHubVisionSection = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError('Please enter a valid email address.');
      setMessage(null);
      return;
    }
    setMessage(
      'Newsletter signup launching soon. Email us at bruce@marcoloai.com to be added manually.',
    );
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background image + heavy overlay (Option A1) */}
      <div className="absolute inset-0 z-0">
        <img
          src={constellationImg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08090A]/80 via-[#08090A]/60 to-[#08090A]/80" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="text-center">
            <p className="eyebrow">The Thesis</p>
            <h2 className="mx-auto mt-4 max-w-[900px] text-[40px] md:text-[56px] font-bold leading-[1.1] tracking-[-0.02em]">
              The AI Executive Team is the{' '}
              <span style={{ color: 'hsl(var(--text-accent))' }}>next</span> operating model.
            </h2>
          </div>

          {/* Body paragraphs */}
          <div className="mx-auto mt-10 max-w-[720px] text-center space-y-5">
            <p className="text-[18px] md:text-[20px] leading-[1.6] text-text-primary">
              SMB and growth-stage companies don't need more software. They need executives —
              people (or systems) who run a domain, make decisions, and deliver results.
            </p>
            <p className="text-[16px] leading-[1.6] text-text-primary">
              For most growing companies, hiring a real CRO, CFO, CTO, or COO isn't realistic.
              The compensation is too high. The fit is too uncertain. The ramp is too long.
            </p>
            <p className="text-[16px] leading-[1.6] text-text-primary">
              AI changes the math. A specialized AI executive — built for a specific domain,
              trained on operator-grade patterns, integrated into your actual workflow — can run
              real execution work today. Not advice. Not analytics. Execution.
            </p>
            <p className="text-[16px] leading-[1.6] text-text-primary">
              MyaiCRO is the first. More are coming, built one at a time, in the order our
              customers tell us they need them most.
            </p>
          </div>

          {/* Newsletter signup */}
          <div className="mt-14 flex justify-center">
            <div className="w-full max-w-[480px] rounded-[12px] border border-white/[0.06] bg-bg-elevated p-6 md:p-8">
              <p className="eyebrow">Stay in the Know</p>
              <h3 className="mt-3 text-[22px] md:text-[24px] font-semibold leading-[1.25] tracking-[-0.01em]">
                Be the first to know what we build next.
              </h3>
              <p className="mt-3 text-[15px] leading-[1.6] text-text-secondary">
                Get monthly updates on Marcolo AI's progress, customer wins, and where the AI
                Executive Team is heading next.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-5 flex flex-col gap-3 sm:flex-row"
                noValidate
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  aria-label="Email address"
                  className="flex-1 rounded-[6px] border border-white/[0.06] bg-bg-base px-3 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/[0.18]"
                />
                <button
                  type="submit"
                  className="rounded-[6px] px-5 py-2.5 text-[15px] font-semibold transition-colors"
                  style={{ background: 'hsl(var(--accent-base))', color: '#08090A' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'hsl(var(--accent-hover))')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = 'hsl(var(--accent-base))')
                  }
                >
                  Subscribe
                </button>
              </form>

              {error && (
                <p className="mt-3 text-[13px] text-warning" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="mt-3 text-[13px] text-text-secondary" role="status">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
