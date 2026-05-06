import React from "react";
import type {
  ComparisonSection,
  Cta,
  CtaSection,
  FaqItem,
  FeatureGridSection,
  HeroSection,
  MarkdownSection,
  PackageGridSection,
  ProofMatrixSection,
  SectionSpec,
} from "@mdwrk/lander-content-contract";
import type { CompiledLanderSite, CompiledPage } from "@mdwrk/lander-core";
import { buildJsonLdGraph } from "@mdwrk/structured-data";
import { LANDER_REACT_VERSION } from "./version.js";

export { LANDER_REACT_VERSION };

export function JsonLd({ graph }: { graph: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

export function CtaLink({ cta }: { cta: Cta }) {
  return (
    <a className={`lander-page__button lander-page__button--${cta.variant ?? "secondary"}`} href={cta.href}>
      {cta.label}
    </a>
  );
}

export function Hero({ section }: { section: HeroSection }) {
  return (
    <section className="lander-page__hero">
      <div className="lander-page__inner">
        {section.eyebrow ? <p className="lander-page__eyebrow">{section.eyebrow}</p> : null}
        <h1 className="lander-page__title">{section.title}</h1>
        <p className="lander-page__intro">{section.subtitle}</p>
        <div className="lander-page__button-row">
          {section.primaryCta ? <CtaLink cta={{ ...section.primaryCta, variant: "primary" }} /> : null}
          {section.secondaryCta ? <CtaLink cta={section.secondaryCta} /> : null}
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({ section }: { section: FeatureGridSection }) {
  return (
    <section className="lander-page__section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="lander-page__grid">
        {section.items.map((item) => (
          <article className="lander-page__card" key={item.title}>
            <h3>{item.href ? <a href={item.href}>{item.title}</a> : item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function MarkdownSectionView({ section }: { section: MarkdownSection }) {
  return (
    <section className="lander-page__section" id={section.id}>
      {section.title ? <h2>{section.title}</h2> : null}
      <div className="lander-page__panel">
        {section.body.split(/\n\s*\n/g).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function FaqBlock({ items }: { items: FaqItem[] }) {
  return (
    <section className="lander-page__section">
      <h2>Frequently Asked Questions</h2>
      <div className="lander-page__grid">
        {items.map((item) => (
          <article className="lander-page__card" key={item.question}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ComparisonMatrix({ section }: { section: ComparisonSection }) {
  return (
    <section className="lander-page__section" id={section.id}>
      <h2>{section.title}</h2>
      <table className="lander-page__comparison">
        <thead>
          <tr>
            <th>Criteria</th>
            {section.columns.map((column) => <th key={column.id}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row) => (
            <tr key={row.id}>
              <th>{row.label}</th>
              {section.columns.map((column) => {
                const cell = row.cells[column.id];
                return <td key={column.id}>{typeof cell === "string" ? cell : cell?.value}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function ProofMatrix({ section }: { section: ProofMatrixSection }) {
  return (
    <section className="lander-page__section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="lander-page__grid">
        {section.items.map((item) => (
          <article className="lander-page__card" key={item.claim}>
            <h3>{item.claim}</h3>
            <p>{item.evidence}</p>
            <p className="lander-page__muted">{item.status}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PackageGrid({ section }: { section: PackageGridSection }) {
  return (
    <section className="lander-page__section" id={section.id}>
      <h2>{section.title}</h2>
      <div className="lander-page__grid">
        {section.packages.map((item) => (
          <article className="lander-page__card" key={item.name}>
            <h3>{item.href ? <a href={item.href}>{item.name}</a> : item.name}</h3>
            <p>{item.description}</p>
            {item.install ? <code>{item.install}</code> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export function CtaBand({ section }: { section: CtaSection }) {
  return (
    <section className="lander-page__section" id={section.id}>
      <div className="lander-page__panel">
        <h2>{section.title}</h2>
        {section.body ? <p>{section.body}</p> : null}
        <div className="lander-page__button-row">
          {section.primaryCta ? <CtaLink cta={{ ...section.primaryCta, variant: "primary" }} /> : null}
          {section.secondaryCta ? <CtaLink cta={section.secondaryCta} /> : null}
        </div>
      </div>
    </section>
  );
}

export function SectionRenderer({ section }: { section: SectionSpec }) {
  switch (section.kind) {
    case "hero":
      return <Hero section={section} />;
    case "feature_grid":
      return <FeatureGrid section={section} />;
    case "feature_detail":
    case "markdown":
      return <MarkdownSectionView section={{ id: section.id, kind: "markdown", title: section.title, body: section.kind === "feature_detail" ? section.body : section.body }} />;
    case "comparison":
      return <ComparisonMatrix section={section} />;
    case "proof_matrix":
      return <ProofMatrix section={section} />;
    case "package_grid":
      return <PackageGrid section={section} />;
    case "pricing":
      return <MarkdownSectionView section={{ id: section.id, kind: "markdown", title: section.title, body: section.body }} />;
    case "cta":
      return <CtaBand section={section} />;
    case "faq":
      return <FaqBlock items={section.items} />;
    default:
      return assertNever(section);
  }
}

export function Breadcrumbs({ page }: { page: CompiledPage }) {
  return (
    <nav aria-label="Breadcrumb" className="lander-page__muted">
      {page.breadcrumbs.map((item, index) => (
        <React.Fragment key={`${item.href}-${item.label}`}>
          {index > 0 ? " / " : null}
          <a href={item.href}>{item.label}</a>
        </React.Fragment>
      ))}
    </nav>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <article className="lander-page">{children}</article>;
}

export function LanderPage({ site, page }: { site: CompiledLanderSite; page: CompiledPage }) {
  const graph = buildJsonLdGraph(site, page);
  return (
    <PageShell>
      <JsonLd graph={graph} />
      <div className="lander-page__inner">
        <Breadcrumbs page={page} />
        {page.sections[0]?.kind !== "hero" ? (
          <header className="lander-page__section">
            <h1>{page.h1}</h1>
            <p className="lander-page__intro">{page.intro}</p>
          </header>
        ) : null}
      </div>
      {page.sections.map((section) => <SectionRenderer key={section.id} section={section} />)}
      {page.faq?.length ? <FaqBlock items={page.faq} /> : null}
    </PageShell>
  );
}

function assertNever(value: never): never {
  throw new Error(`Unsupported section: ${JSON.stringify(value)}`);
}
