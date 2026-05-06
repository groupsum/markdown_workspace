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
import {
  articleNode,
  blogPostingNode,
  breadcrumbListSchema,
  datasetNode,
  faqPageSchema,
  howToNode,
  imageObjectSchema,
  itemListNode,
  jsonLdGraph,
  organizationNode,
  productNode,
  profilePageNode,
  softwareApplicationNode,
  softwareSourceCodeNode,
  stableId,
  techArticleNode,
  videoObjectNode,
  webApplicationNode,
  webPageSchema,
  webSiteSchema,
  type JsonLd,
} from "@mdwrk/structured-data";
import { LANDER_REACT_VERSION } from "./version.js";

export { LANDER_REACT_VERSION };

export function JsonLd({ graph }: { graph: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

const absoluteHref = (baseUrl: string, href: string): string =>
  href.startsWith("http") ? href : `${baseUrl.replace(/\/+$/, "")}${href.startsWith("/") ? href : `/${href}`}`;

const dataRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const stringValue = (value: unknown): string | undefined => (typeof value === "string" && value.trim() ? value : undefined);

const jsonLdValue = (value: unknown): JsonLd | string | undefined =>
  typeof value === "string" || (value && typeof value === "object" && !Array.isArray(value))
    ? (value as JsonLd | string)
    : undefined;

const jsonLdArrayValue = (value: unknown): JsonLd | JsonLd[] | undefined =>
  value && typeof value === "object" ? (value as JsonLd | JsonLd[]) : undefined;

const stringArrayValue = (value: unknown): string[] | undefined =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim())) : undefined;

function schemaData(page: CompiledPage, kind: string): Record<string, unknown> {
  return dataRecord(page.schema?.find((schema) => schema.kind === kind)?.data);
}

function shouldEmit(page: CompiledPage, kind: string, defaults = false): boolean {
  return defaults || Boolean(page.schema?.some((schema) => schema.kind === kind));
}

export function buildLanderJsonLdGraph(site: CompiledLanderSite, page: CompiledPage): JsonLd {
  const nodes: JsonLd[] = [];
  const canonicalRoot = site.product.canonicalUrl.replace(/\/+$/, "");
  const organizationData = schemaData(page, "Organization");
  const organization = organizationNode({
    id: stringValue(organizationData.id) ?? stableId(canonicalRoot, "organization"),
    name: stringValue(organizationData.name) ?? site.product.name,
    description: stringValue(organizationData.description) ?? site.product.description,
    url: stringValue(organizationData.url) ?? `${canonicalRoot}/`,
    logo: stringValue(organizationData.logo) ?? site.product.logo,
    sameAs: stringArrayValue(organizationData.sameAs) ?? site.product.sameAs,
  });
  const websiteData = schemaData(page, "WebSite");
  const website = webSiteSchema({
    id: stringValue(websiteData.id) ?? stableId(canonicalRoot, "website"),
    name: stringValue(websiteData.name) ?? site.product.name,
    description: stringValue(websiteData.description) ?? site.product.description,
    url: stringValue(websiteData.url) ?? `${canonicalRoot}/`,
    image: stringValue(websiteData.image) ?? site.product.logo,
    publisher: jsonLdValue(websiteData.publisher) ?? organization,
  });
  const breadcrumbData = schemaData(page, "BreadcrumbList");
  const breadcrumb = breadcrumbListSchema({
    id: stringValue(breadcrumbData.id) ?? stableId(page.canonicalUrl, "breadcrumbs"),
    items: page.breadcrumbs.map((item) => ({ label: item.label, href: absoluteHref(canonicalRoot, item.href) })),
  });
  const pageImage = page.seo?.image ?? site.seo?.defaultImage;
  const imageData = schemaData(page, "ImageObject");
  const image = imageObjectSchema({
    id: stringValue(imageData.id) ?? stableId(page.canonicalUrl, "image"),
    name: stringValue(imageData.name) ?? pageImage?.alt ?? `${page.h1} image`,
    description: stringValue(imageData.description) ?? page.description,
    url: stringValue(imageData.url) ?? pageImage?.src,
    contentUrl: stringValue(imageData.contentUrl) ?? pageImage?.src,
    width: typeof imageData.width === "number" ? imageData.width : pageImage?.width,
    height: typeof imageData.height === "number" ? imageData.height : pageImage?.height,
    caption: stringValue(imageData.caption) ?? pageImage?.alt,
  });
  const pageData = schemaData(page, "WebPage");
  const webPage = webPageSchema({
    id: stringValue(pageData.id) ?? stableId(page.canonicalUrl, "webpage"),
    name: stringValue(pageData.name) ?? page.title,
    description: stringValue(pageData.description) ?? page.description,
    url: stringValue(pageData.url) ?? page.canonicalUrl,
    image: jsonLdValue(pageData.image) ?? (pageImage ? image : undefined),
    breadcrumb,
    isPartOf: jsonLdValue(pageData.isPartOf) ?? website,
    mainEntity: jsonLdValue(pageData.mainEntity),
    datePublished: stringValue(pageData.datePublished),
    dateModified: stringValue(pageData.dateModified),
  });

  nodes.push(organization, website, webPage);
  if (shouldEmit(page, "BreadcrumbList", page.breadcrumbs.length > 1)) nodes.push(breadcrumb);
  if (shouldEmit(page, "ImageObject", Boolean(pageImage))) nodes.push(image);

  const appDefaults = {
    id: stableId(canonicalRoot, "software-application"),
    name: site.product.name,
    description: site.product.description,
    url: `${canonicalRoot}/`,
    image: site.product.logo,
    applicationCategory: site.product.category,
  };
  if (shouldEmit(page, "SoftwareApplication", page.kind === "home")) {
    const data = schemaData(page, "SoftwareApplication");
    nodes.push(softwareApplicationNode({ ...appDefaults, ...data }));
  }
  if (shouldEmit(page, "WebApplication")) {
    const data = schemaData(page, "WebApplication");
    nodes.push(webApplicationNode({ ...appDefaults, id: stableId(canonicalRoot, "web-application"), ...data }));
  }
  if (shouldEmit(page, "Product", page.kind === "home")) {
    const data = schemaData(page, "Product");
    nodes.push(productNode({
      id: stringValue(data.id) ?? stableId(canonicalRoot, "product"),
      name: stringValue(data.name) ?? site.product.name,
      description: stringValue(data.description) ?? site.product.description,
      url: stringValue(data.url) ?? `${canonicalRoot}/`,
      image: jsonLdValue(data.image) ?? site.product.logo,
      brand: jsonLdValue(data.brand) ?? organization,
      category: stringValue(data.category) ?? site.product.category,
      offers: jsonLdValue(data.offers) as JsonLd | undefined,
    }));
  }

  const articleDefaults = {
    id: stableId(page.canonicalUrl, "article"),
    name: page.h1,
    headline: page.title,
    description: page.description,
    url: page.canonicalUrl,
    image: pageImage,
    publisher: organization,
    author: organization,
  };
  if (shouldEmit(page, "Article", ["trust", "proof", "compare"].includes(page.kind))) {
    nodes.push(articleNode({ ...articleDefaults, ...schemaData(page, "Article") }));
  }
  if (shouldEmit(page, "TechArticle", ["answer", "feature", "docs_bridge", "package"].includes(page.kind))) {
    nodes.push(techArticleNode({ ...articleDefaults, id: stableId(page.canonicalUrl, "tech-article"), ...schemaData(page, "TechArticle") }));
  }
  if (shouldEmit(page, "BlogPosting")) {
    nodes.push(blogPostingNode({ ...articleDefaults, id: stableId(page.canonicalUrl, "blog-posting"), ...schemaData(page, "BlogPosting") }));
  }
  if (shouldEmit(page, "FAQPage", Boolean(page.faq?.length))) {
    const data = schemaData(page, "FAQPage");
    nodes.push(faqPageSchema({
      id: stringValue(data.id) ?? stableId(page.canonicalUrl, "faq"),
      items: Array.isArray(data.items) ? data.items as Array<{ question: string; answer: string }> : page.faq ?? [],
    }));
  }
  if (shouldEmit(page, "SoftwareSourceCode", page.kind === "package")) {
    const data = schemaData(page, "SoftwareSourceCode");
    nodes.push(softwareSourceCodeNode({
      id: stringValue(data.id) ?? stableId(page.canonicalUrl, "software-source-code"),
      name: stringValue(data.name) ?? page.h1,
      description: stringValue(data.description) ?? page.description,
      url: stringValue(data.url) ?? page.canonicalUrl,
      codeRepository: stringValue(data.codeRepository),
      programmingLanguage: stringValue(data.programmingLanguage) ?? "TypeScript",
      runtimePlatform: stringValue(data.runtimePlatform),
    }));
  }
  if (shouldEmit(page, "Dataset")) {
    const data = schemaData(page, "Dataset");
    nodes.push(datasetNode({
      id: stringValue(data.id) ?? stableId(page.canonicalUrl, "dataset"),
      name: stringValue(data.name) ?? `${page.h1} dataset`,
      description: stringValue(data.description) ?? page.description,
      url: stringValue(data.url) ?? page.canonicalUrl,
      creator: jsonLdValue(data.creator) ?? organization,
      distribution: jsonLdArrayValue(data.distribution),
      keywords: stringArrayValue(data.keywords) ?? page.seo?.keywords,
      datePublished: stringValue(data.datePublished),
      dateModified: stringValue(data.dateModified),
    }));
  }
  if (shouldEmit(page, "ProfilePage")) {
    const data = schemaData(page, "ProfilePage");
    nodes.push(profilePageNode({
      id: stringValue(data.id) ?? stableId(page.canonicalUrl, "profile"),
      name: stringValue(data.name) ?? page.h1,
      description: stringValue(data.description) ?? page.description,
      url: stringValue(data.url) ?? page.canonicalUrl,
      image: jsonLdValue(data.image) ?? pageImage,
      mainEntity: jsonLdValue(data.mainEntity) ?? organization,
    }));
  }
  if (shouldEmit(page, "VideoObject")) {
    const data = schemaData(page, "VideoObject");
    nodes.push(videoObjectNode({
      id: stringValue(data.id) ?? stableId(page.canonicalUrl, "video"),
      name: stringValue(data.name) ?? page.h1,
      description: stringValue(data.description) ?? page.description,
      url: stringValue(data.url) ?? page.canonicalUrl,
      thumbnailUrl: stringValue(data.thumbnailUrl) ?? pageImage?.src ?? site.product.logo?.src ?? `${canonicalRoot}/favicon.svg`,
      uploadDate: stringValue(data.uploadDate) ?? stringValue(data.datePublished) ?? stringValue(data.dateModified) ?? "2026-05-06",
      duration: stringValue(data.duration),
      embedUrl: stringValue(data.embedUrl),
      contentUrl: stringValue(data.contentUrl),
    }));
  }
  if (shouldEmit(page, "ItemList")) {
    const data = schemaData(page, "ItemList");
    const items = Array.isArray(data.items)
      ? data.items as Array<{ name: string; url?: string }>
      : page.sections.map((section) => ({ name: section.title ?? section.id, url: `${page.canonicalUrl}#${section.id}` }));
    nodes.push(itemListNode({ id: stringValue(data.id) ?? stableId(page.canonicalUrl, "item-list"), name: stringValue(data.name) ?? page.h1, items }));
  }
  if (shouldEmit(page, "HowTo")) {
    const data = schemaData(page, "HowTo");
    nodes.push(howToNode({
      id: stringValue(data.id) ?? stableId(page.canonicalUrl, "how-to"),
      name: stringValue(data.name) ?? page.h1,
      description: stringValue(data.description) ?? page.description,
      url: stringValue(data.url) ?? page.canonicalUrl,
      image: jsonLdValue(data.image) ?? pageImage,
      steps: Array.isArray(data.steps)
        ? data.steps as Array<{ name: string; text: string; url?: string }>
        : [{ name: page.h1, text: page.intro, url: page.canonicalUrl }],
      totalTime: stringValue(data.totalTime),
    }));
  }

  return jsonLdGraph(nodes, stableId(page.canonicalUrl, "jsonld"));
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
  const graph = buildLanderJsonLdGraph(site, page);
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
