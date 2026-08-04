import Image from "next/image";
import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowUpRight,
  Camera,
  ChatsCircle,
  ChatTeardropText,
  ClipboardText,
  CrownSimple,
  ShieldCheck,
  Sparkle,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageCta, PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import {
  CORE_SERVICES,
  SPECIALIST_SERVICES,
  type ServiceIcon,
  type ServiceOffering,
} from "@/content/services";
import { JsonLd } from "@/components/seo/json-ld";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  servicesJsonLd,
} from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Marriage Services",
  description:
    "Marriage readiness, coaching, curated matchmaking, concierge search, verification, image support, photography, and private guidance.",
  path: "/services",
  image: "/images/vowfound-rings.png",
});

const SERVICE_ICONS = {
  audit: ClipboardText,
  coaching: ChatsCircle,
  matchmaking: UsersThree,
  concierge: CrownSimple,
  style: Sparkle,
  photography: Camera,
  verification: ShieldCheck,
  advisor: ChatTeardropText,
} satisfies Record<ServiceIcon, Icon>;

export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ])}
      />
      <JsonLd data={servicesJsonLd()} />
      <PageHeader
        eyebrow="Marriage services"
        title="Support for the path to marriage."
        standfirst="Start with readiness. Add introductions, verification, presentation, and private guidance only when they improve the outcome."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="01 / 04"
              eyebrow="The core practice"
              title="Four levels of responsibility. One considered starting point."
              body="These services are available now. The assessment recommends the smallest useful place to begin."
            />
          </Reveal>

          <div className="mt-14 border-b border-hairline">
            {CORE_SERVICES.map((service, index) => (
              <Reveal key={service.id} delay={index * 55}>
                <ServiceRow service={service} index={index} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border border-hairline">
                  <Image
                    src="/images/vowfound-rings.png"
                    alt="Two wedding bands beside handwritten stationery and a deep red flower"
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/45 via-transparent to-transparent" />
                </div>
                <h2 className="display-lg mt-9 text-onink">Specialist support</h2>
                <p className="mt-6 max-w-xl text-onink-dim">
                  Useful when it solves a specific problem. Never bundled in
                  simply to make a programme look larger.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4">
              {SPECIALIST_SERVICES.map((service, index) => (
                <Reveal key={service.id} delay={index * 55}>
                  <ServiceRow service={service} index={index} specialist />
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <PageCta
        title="You do not need every service."
        body="Begin with the assessment. We will recommend one useful next step and explain why it fits."
      />
    </>
  );
}

function ServiceRow({
  service,
  index,
  specialist = false,
}: {
  service: ServiceOffering;
  index: number;
  specialist?: boolean;
}) {
  const Icon = SERVICE_ICONS[service.icon];

  return (
    <article
      id={service.id}
      className={cn(
        "group scroll-mt-32 transition-[border-color,background-color,transform] duration-300",
        specialist
          ? "rounded-[12px] border border-onink/12 bg-onink/[0.025] p-6 hover:-translate-y-0.5 hover:border-rose/35 hover:bg-onink/[0.045] md:p-8"
          : "grid gap-6 border-t border-hairline py-8 hover:bg-onink/[0.018] md:grid-cols-[4rem_1fr_auto] md:items-start md:px-4 md:py-10",
      )}
    >
      <div className={cn("flex items-start justify-between gap-5", !specialist && "md:block")}>
        {!specialist && (
          <p className="numeral display text-[2.5rem] leading-none text-onink-faint transition-colors group-hover:text-rose">
            {String(index + 1).padStart(2, "0")}
          </p>
        )}
        {specialist && (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-rose/35 text-rose">
          <Icon aria-hidden className="size-5" weight="regular" />
        </span>
        )}
        <span className="engraved text-[9px] text-onink-faint">
          {service.availability}
        </span>
      </div>

      <div className={cn(specialist && "mt-7")}>
        <h3 className="display-md max-w-lg text-onink">{service.name}</h3>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-onink-dim">
          {service.detail}
        </p>
      </div>
      <Link
        href={service.actionHref}
        data-analytics-event="service_select"
        data-analytics-service={service.id}
        data-analytics-placement="services_page"
        className={cn(
          "inline-flex items-center gap-2 text-[14px] font-medium text-onink transition-colors hover:text-rose",
          specialist ? "mt-7" : "md:mt-1",
        )}
      >
        {service.actionLabel}
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </Link>
    </article>
  );
}
