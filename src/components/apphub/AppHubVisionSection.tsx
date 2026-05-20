import { useState, type FormEvent } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import constellationImg from '@/assets/apphub-vision-constellation.png';

const ENDPOINT =
  'https://fqazmwotrxbsaysjdgsk.supabase.co/functions/v1/public-newsletter-signup';

export const AppHubVisionSection = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          source: 'myaiapps',
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Signup failed');

      setSuccess(true);
      setFirstName('');
      setLastName('');
      setEmail('');
      toast({
        title: "You're on the list!",
        description: "We'll keep you posted on what we build next.",
      });
    } catch (err: any) {
      toast({
        title: 'Something went wrong',
        description: err?.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
            <div className="w-full max-w-[560px] rounded-[12px] border border-white/[0.06] bg-bg-elevated p-6 md:p-8">
              {success ? (
                <div className="flex flex-col items-center text-center py-4">
                  <CheckCircle2
                    className="h-10 w-10 mb-3"
                    style={{ color: 'hsl(var(--accent-base))' }}
                  />
                  <h3 className="text-[22px] md:text-[24px] font-semibold leading-[1.25] tracking-[-0.01em]">
                    You're on the list.
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-text-secondary">
                    We'll send you updates as we ship new MyaiApps.
                  </p>
                </div>
              ) : (
                <>
                  <p className="eyebrow">Stay in the Know</p>
                  <h3 className="mt-3 text-[22px] md:text-[24px] font-semibold leading-[1.25] tracking-[-0.01em]">
                    Be the first to know what we build next.
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.6] text-text-secondary">
                    Get monthly updates on Marcolo AI's progress, customer wins, and where the AI
                    Executive Team is heading next.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
                    {/* Honeypot */}
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: '-10000px',
                        width: 1,
                        height: 1,
                        overflow: 'hidden',
                      }}
                    >
                      <label>
                        Website
                        <input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name (optional)"
                        aria-label="First name"
                        maxLength={100}
                        className="rounded-[6px] border border-white/[0.06] bg-bg-base px-3 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/[0.18]"
                      />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name (optional)"
                        aria-label="Last name"
                        maxLength={100}
                        className="rounded-[6px] border border-white/[0.06] bg-bg-base px-3 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/[0.18]"
                      />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        aria-label="Email address"
                        maxLength={255}
                        className="flex-1 rounded-[6px] border border-white/[0.06] bg-bg-base px-3 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/[0.18]"
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-[6px] px-5 py-2.5 text-[15px] font-semibold transition-colors disabled:opacity-60"
                        style={{ background: 'hsl(var(--accent-base))', color: '#08090A' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'hsl(var(--accent-hover))')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = 'hsl(var(--accent-base))')
                        }
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Subscribing…
                          </>
                        ) : (
                          'Subscribe'
                        )}
                      </button>
                    </div>

                    {error && (
                      <p className="text-[13px] text-warning" role="alert">
                        {error}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
