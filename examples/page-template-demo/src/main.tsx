import React from "react";
import { createRoot } from "react-dom/client";
import type { CompiledLanderSite, CompiledPage } from "@mdwrk/lander-core";
import { LanderPage } from "@mdwrk/lander-react";
import {
  getPageTemplateDemoHomeLinks,
  getPageTemplateDemoHomeNavigation,
  pageTemplateDemoContentPack,
} from "@mdwrk/page-template-demo-content-pack";
import "./styles.css";

function normalizeRouteSlug(value: string) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
}

function canonicalForSlug(productUrl: string, slug: string) {
  return `${productUrl.replace(/\/+$/, "")}${normalizeRouteSlug(slug)}`;
}

function buildBreadcrumbs(page: { slug: string; h1: string }) {
  const slug = normalizeRouteSlug(page.slug);
  if (slug === "/") return [{ label: page.h1, href: "/" }];
  const parts = slug.replace(/^\/|\/$/g, "").split("/");
  const crumbs = [{ label: "Home", href: "/" }];
  let cursor = "";
  for (const part of parts) {
    cursor += `/${part}`;
    crumbs.push({
      label: part.replace(/-/g, " ").replace(/\b\w/g, (value) => value.toUpperCase()),
      href: normalizeRouteSlug(cursor),
    });
  }
  crumbs[crumbs.length - 1] = { label: page.h1, href: slug };
  return crumbs;
}

function compileDemoSite(input: Omit<CompiledLanderSite, "pages" | "pageByPath" | "diagnostics"> & { pages: typeof pageTemplateDemoContentPack.pages }): CompiledLanderSite {
  const pages = input.pages.map((page): CompiledPage => {
    const path = normalizeRouteSlug(page.slug);
    const canonicalUrl = page.seo?.canonical ?? canonicalForSlug(input.product.canonicalUrl, path);
    return {
      ...page,
      slug: path,
      path,
      canonicalUrl,
      breadcrumbs: buildBreadcrumbs({ slug: path, h1: page.h1 }),
      internalLinks: [],
      wordCount: [page.title, page.description, page.h1, page.intro].join(" ").split(/\s+/).filter(Boolean).length,
      componentIntents: (page.componentIntents ?? []).map((intent) => ({ ...intent, pagePath: path, source: "declared" })),
      schemaIntents: (page.schema ?? []).map((intent, index) => ({
        ...intent,
        id: intent.id ?? `${path}#schema-${index + 1}`,
        pagePath: path,
        source: "schema",
      })),
    };
  });

  return {
    ...input,
    pages,
    pageByPath: new Map(pages.map((page) => [page.path, page])),
    diagnostics: [],
  };
}

const site = compileDemoSite({
  product: {
    name: "Acme Notebook",
    slug: "acme-notebook",
    tagline: "Page templates rendered through lander-react.",
    description: "A containerized demo site generated from reusable page templates and a content-pack preset.",
    category: "SoftwareApplication",
    canonicalUrl: "http://localhost:4179",
  },
  nav: {
    primary: [
      { label: "Home", href: "/demo/" },
      { label: "Feature", href: "/demo/features/core/" },
      { label: "Pricing", href: "/demo/pricing/" },
      { label: "Support", href: "/demo/support/" },
    ],
  },
  footer: {
    links: [
      { label: "Privacy", href: "/demo/privacy/" },
      { label: "Terms", href: "/demo/terms/" },
    ],
    note: "Generated from @mdwrk/page-template-demo-content-pack.",
  },
  pages: [...pageTemplateDemoContentPack.pages],
  ai: {
    summary: "Demo content pack for reusable page-template graphs.",
    coreFacts: [
      "The preset owns graph shape and relationship slots.",
      "The content pack owns authored page content.",
      "The app compiles PageSpec objects and renders them with lander-react.",
    ],
  },
});

const homeLinks = getPageTemplateDemoHomeLinks();
const homeNavigation = getPageTemplateDemoHomeNavigation();
const relationshipRows = [
  {
    slot: "children",
    meaning: "pages linked from this parent page",
    links: homeLinks.children,
  },
  {
    slot: "support",
    meaning: "support pages linked from this parent page",
    links: homeLinks.support,
  },
  {
    slot: "legal",
    meaning: "policy pages linked from this parent page",
    links: homeLinks.legal,
  },
];
const graphNodes = site.pages.map((demoPage) => {
  const pageShell = demoPage.componentIntents.find((intent) => intent.kind === "page_shell");
  const templateId = typeof pageShell?.data?.templateId === "string" ? pageShell.data.templateId : demoPage.kind;
  const isLinkedFromHome = relationshipRows.some((row) => row.links.some((link) => normalizeRouteSlug(link.href) === demoPage.path));
  return {
    id: demoPage.path,
    title: demoPage.title,
    path: demoPage.path,
    kind: demoPage.kind,
    templateId,
    state: demoPage.path === "/demo/" ? "parent page" : isLinkedFromHome ? "linked from parent" : "included page",
    schema: demoPage.schema.map((schema) => schema.kind),
  };
});

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") return "/demo/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function selectPage(): CompiledPage {
  const path = normalizePath(window.location.pathname);
  return site.pageByPath.get(path) ?? site.pageByPath.get("/demo/") ?? site.pages[0];
}

function linkClassName(href: string, current: string) {
  return normalizePath(href) === current ? "demo-nav__link is-active" : "demo-nav__link";
}

function DemoShell() {
  const page = selectPage();
  const current = normalizePath(page.path);
  const isHome = current === "/demo/";

  return (
    <div className="demo-app">
      <header className="demo-header">
        <a className="demo-brand" href="/demo/" aria-label="Acme Notebook home">
          <span className="demo-brand__mark" aria-hidden="true" />
          <span>
            <span className="demo-brand__name">Acme Notebook</span>
            <span className="demo-brand__meta">Page Template Demo</span>
          </span>
        </a>
        <nav className="demo-nav" aria-label="Demo pages">
          {site.nav?.primary.map((item) => (
            <a key={item.href} className={linkClassName(item.href, current)} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {isHome ? (
        <>
          <section className="demo-hero" aria-label="Template graph summary">
            <div className="demo-hero__copy">
              <p className="demo-kicker">Page-template graph contract</p>
              <h1>This demo shows the sitemap graph, not a notebook product.</h1>
              <p>
                The content pack authors page content. The preset supplies graph shape, template IDs, relationship slots,
                and link targets. The app renders the selected generated page with lander-react.
              </p>
              <dl className="demo-summary">
                <div>
                  <dt>Preset</dt>
                  <dd>{pageTemplateDemoContentPack.presetId}</dd>
                </div>
                <div>
                  <dt>Domain</dt>
                  <dd>{pageTemplateDemoContentPack.domain}</dd>
                </div>
                <div>
                  <dt>Pages</dt>
                  <dd>{pageTemplateDemoContentPack.pages.length}</dd>
                </div>
                <div>
                  <dt>Diagnostics</dt>
                  <dd>{pageTemplateDemoContentPack.diagnostics.length}</dd>
                </div>
              </dl>
            </div>
            <div className="demo-graph" aria-label="Home page relationship slots">
              <div className="demo-graph__header">
                <span className="demo-graph__node is-root">/demo/</span>
                <span>home template: product.home</span>
              </div>
              {relationshipRows.map((row) => (
                <div className="demo-graph__row" key={row.slot}>
                  <div>
                    <strong>{row.slot}</strong>
                    <span>{row.meaning}</span>
                  </div>
                  <div className="demo-graph__links">
                    {row.links.map((link) => (
                      <a key={link.id} href={link.href}>
                        <span>{link.label}</span>
                        <code>{link.targetTemplateId}</code>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="demo-contract" aria-label="Generated graph nodes">
            <div className="demo-contract__intro">
              <p className="demo-kicker">Generated PageSpec inventory</p>
              <h2>Each node is a page instance with a template, schema intents, and link status.</h2>
            </div>
            <div className="demo-node-grid">
              {graphNodes.map((node) => (
                <a className="demo-node-card" key={node.id} href={node.path}>
                  <span className="demo-node-card__state">{node.state}</span>
                  <strong>{node.title}</strong>
                  <span>{node.path}</span>
                  <code>{node.templateId}</code>
                  <small>{node.schema.join(" + ") || "WebPage"}</small>
                </a>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="demo-subpage-context" aria-label="Current graph node context">
          <span>Graph node</span>
          <strong>{page.title}</strong>
          <code>{page.path}</code>
        </section>
      )}

      <main className="demo-main">
        <aside className="demo-sidebar" aria-label="Resolved template navigation">
          <h2>Resolved Output</h2>
          <p>The left graph is the source relationship contract. This panel shows what the app can derive from it.</p>
          <div className="demo-sidebar__group">
            <h3>Breadcrumbs</h3>
            {homeNavigation.breadcrumbs.map((link) => (
              <a key={`${link.href}-${link.label}`} href={link.href}>{link.label}</a>
            ))}
          </div>
          <div className="demo-sidebar__group">
            <h3>Related</h3>
            {homeNavigation.related.map((link) => (
              <a key={`${link.href}-${link.label}`} href={link.href}>{link.label}</a>
            ))}
          </div>
        </aside>
        <section className="demo-page-frame" aria-label="Rendered page template">
          <div className="demo-render-label">
            <span>Rendered lander-react page</span>
            <code>{page.path}</code>
          </div>
          <LanderPage site={site} page={page} />
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <DemoShell />
  </React.StrictMode>,
);
