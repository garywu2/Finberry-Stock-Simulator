import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AreaChart,
  Avatar,
  BerryMark,
  BrandFooter,
  Caret,
  Field,
  Logo,
  Pill,
  Sparkline,
  StatCard,
  TopNav,
} from '@/components/brand';

// Dev-only gallery of the Berry Bright primitives (route: /preview). Lets us
// eyeball the components against the design screenshots before Phase 2 composes
// them into real pages. Not linked from the app.

// Seeded random walk purely for demo data (real charts take API price series).
function demoSeries(seed: number, n = 60, trend = 0.4): number[] {
  let x = seed % 233280;
  const rnd = () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < n; i++) {
    v += (rnd() - 0.5 + trend * 0.04) * 4;
    out.push(v);
  }
  return out;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-4 font-display text-[18px] font-bold text-ink">{title}</h2>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-bg font-sans text-ink">
      <TopNav active="Simulator" user="Maya Chen" balance="$112,480.55" />

      <div className="mx-auto max-w-[1100px] px-8 py-10">
        <div className="mb-10">
          <span className="font-display text-[12px] font-bold uppercase tracking-[.08em] text-violet">
            Berry Bright
          </span>
          <h1 className="font-display text-[34px] font-bold text-ink">Component preview</h1>
        </div>

        <Section title="Logo & mark">
          <Logo size={30} />
          <BerryMark size={40} />
        </Section>

        <Section title="Buttons">
          <Button variant="primary">Get started</Button>
          <Button variant="ghost">Reset run</Button>
          <Button variant="buy">Review buy order</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
        </Section>

        <Section title="Pills">
          <Pill tone="up">
            <Caret up />
            +1.15%
          </Pill>
          <Pill tone="dn">
            <Caret />
            -0.84%
          </Pill>
          <Pill tone="violet">Diamond</Pill>
          <Pill tone="gold">★ Plus</Pill>
          <Pill tone="pink">New</Pill>
          <Pill tone="mute">Market</Pill>
        </Section>

        <Section title="Avatars">
          <Avatar name="Maya Chen" size={56} ring="#7C3AED" />
          <Avatar name="Diego Invests" size={56} />
          <Avatar name="Brooke Lin" size={44} />
          <Avatar name="Gary Wu" size={36} />
        </Section>

        <Section title="Stat cards">
          <StatCard label="Buying power" value="$24,310.18" />
          <StatCard label="Total return" value="+$22,480.55">
            <Pill tone="up">24.97% all-time</Pill>
          </StatCard>
          <StatCard label="Invested" value="$88,170.37" sub="Across 5 positions" />
        </Section>

        <Section title="Charts">
          <Card className="w-full p-6">
            <div className="h-[240px]">
              <AreaChart data={demoSeries(7, 90, 0.6)} up grid />
            </div>
          </Card>
          <Sparkline data={demoSeries(3, 30, 0.5)} up />
          <Sparkline data={demoSeries(9, 30, -0.5)} up={false} />
        </Section>

        <Section title="Field">
          <div className="w-[280px]">
            <Field label="Symbol" placeholder="NVDA" />
          </div>
        </Section>
      </div>

      <BrandFooter />
    </div>
  );
}
