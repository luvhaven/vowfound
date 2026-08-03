import { Container, Section } from "@/components/ui/layout";

export default function SiteLoading() {
  return (
    <div aria-busy="true" aria-label="Loading page">
      <div className="min-h-[32rem] border-b border-hairline">
        <Container className="grid min-h-[32rem] content-center gap-5">
          <div className="h-3 w-28 animate-pulse rounded-full bg-onink/10" />
          <div className="h-16 max-w-3xl animate-pulse rounded-[12px] bg-onink/7 md:h-24" />
          <div className="h-6 max-w-xl animate-pulse rounded-[8px] bg-onink/6" />
        </Container>
      </div>
      <Section>
        <Container>
          <div className="grid gap-px border-y border-hairline md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="min-h-40 animate-pulse bg-white/[0.025]" />
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
