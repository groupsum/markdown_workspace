import { compileLanderSite, defineLanderSite } from '@mdwrk/lander-core';
import type { PageSpec, SectionSpec } from '@mdwrk/lander-content-contract';

const ctaSection = (id: string): SectionSpec => ({
  id,
  kind: 'cta',
  title: 'Start from the MdWrk workspace',
  body: 'Open the workspace when you want the product surface, or use the docs when you need package and extension implementation details.',
  primaryCta: { label: 'Open MdWrk', href: '/app/' },
  secondaryCta: { label: 'Read the docs', href: '/docs/' },
});

const featurePage = ({
  slug,
  title,
  description,
  h1,
  intro,
  detail,
}: {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  detail: string;
}): PageSpec => ({
  kind: 'feature',
  slug,
  title,
  description,
  h1,
  intro,
  sections: [
    {
      id: 'overview',
      kind: 'feature_detail',
      title: h1,
      body: detail,
      items: [
        {
          title: 'Local-first workflow',
          description: 'The feature is described in terms of local workspace behavior before optional hosted integrations.',
          href: '/features/local-first-markdown-workspace/',
        },
        {
          title: 'Documented package surface',
          description: 'Reusable renderer, editor, theme, and extension packages stay visible from the lander path.',
          href: '/packages/markdown-renderer-core/',
        },
      ],
    },
    ctaSection('feature-cta'),
  ],
  faq: [
    {
      question: `What does ${h1} mean in MdWrk?`,
      answer: description,
    },
    {
      question: 'Does this feature require a hosted backend?',
      answer: 'Normal authoring remains local-first. Networked sync, repository, and deployment workflows are optional integration paths.',
    },
  ],
  schema: [{ kind: 'TechArticle' }, { kind: 'SoftwareApplication' }],
});

const answerPage = (slug: string, title: string, answer: string): PageSpec => ({
  kind: 'answer',
  slug,
  title,
  description: answer,
  h1: title,
  intro: answer,
  sections: [
    {
      id: 'answer',
      kind: 'markdown',
      title,
      body: `${answer}\n\nMdWrk explains this answer through product pages, package pages, and proof pages so readers can move from a direct answer into implementation details without losing the local-first boundary.`,
    },
    ctaSection('answer-cta'),
  ],
  faq: [
    {
      question: title,
      answer,
    },
  ],
  schema: [{ kind: 'FAQPage' }, { kind: 'TechArticle' }],
});

const comparePage = (slug: string, title: string, alternative: string): PageSpec => ({
  kind: 'compare',
  slug,
  title,
  description: `Compare MdWrk with ${alternative} for local-first Markdown writing, workspace behavior, package reuse, privacy boundaries, and extension surfaces.`,
  h1: title,
  intro: `Use this comparison when deciding whether MdWrk or ${alternative} better fits a local-first Markdown workspace, package reuse, and extension-oriented workflow.`,
  sections: [
    {
      id: 'matrix',
      kind: 'comparison',
      title: `${title} comparison matrix`,
      columns: [
        { id: 'mdwrk', label: 'MdWrk' },
        { id: 'alternative', label: alternative },
      ],
      rows: [
        {
          id: 'local-first',
          label: 'Local-first Markdown',
          cells: {
            mdwrk: 'Browser/PWA-centered workspace with local persistence as a core product boundary.',
            alternative: 'Depends on the product model; this page frames the practical difference for Markdown work.',
          },
        },
        {
          id: 'packages',
          label: 'Reusable packages',
          cells: {
            mdwrk: 'Renderer, editor, theme, extension, and lander packages are documented as reusable surfaces.',
            alternative: 'Usually evaluated as an app first rather than a portable package platform.',
          },
        },
        {
          id: 'extensions',
          label: 'Extension surface',
          cells: {
            mdwrk: 'Governed extension contracts and installable extension packages are part of the platform story.',
            alternative: 'Extension behavior varies by product and is not always a package contract.',
          },
        },
      ],
    },
    ctaSection('compare-cta'),
  ],
  faq: [
    {
      question: `When should I choose MdWrk over ${alternative}?`,
      answer: 'Choose MdWrk when local-first Markdown authoring, browser/PWA availability, package reuse, and governed extension surfaces matter more than a single-purpose editor experience.',
    },
  ],
  schema: [{ kind: 'TechArticle' }, { kind: 'ItemList' }],
});

const packagePage = (slug: string, packageName: string, description: string): PageSpec => ({
  kind: 'package',
  slug,
  title: `${packageName} | MdWrk package`,
  description,
  h1: packageName,
  intro: description,
  sections: [
    {
      id: 'package',
      kind: 'package_grid',
      title: 'Install and API surface',
      packages: [
        {
          name: packageName,
          description,
          install: `npm install ${packageName}`,
          href: '/docs/getting-started/standalone-modules/',
          api: ['ES module exports', 'TypeScript declarations', 'package README'],
        },
      ],
    },
    ctaSection('package-cta'),
  ],
  schema: [{ kind: 'SoftwareSourceCode' }, { kind: 'TechArticle' }],
});

const proofPage = (slug: string, title: string, description: string): PageSpec => ({
  kind: 'proof',
  slug,
  title,
  description,
  h1: title,
  intro: description,
  sections: [
    {
      id: 'proof',
      kind: 'proof_matrix',
      title: `${title} proof matrix`,
      items: [
        {
          claim: 'Public content is crawlable without relying on the application shell.',
          status: 'verified',
          evidence: 'The Vite/static lander emits static HTML, sitemap, robots, LLM files, content indexes, and JSON-LD graph artifacts.',
          href: '/proof/package-surfaces/',
        },
        {
          claim: 'Reusable packages have explicit package boundaries.',
          status: 'supported',
          evidence: 'The lander package family is classified separately from apps, editor packages, renderer packages, and extensions.',
          href: '/packages/markdown-renderer-core/',
        },
      ],
    },
    ctaSection('proof-cta'),
  ],
  schema: [{ kind: 'ItemList' }, { kind: 'TechArticle' }],
});

const homePage: PageSpec = {
  kind: 'home',
  slug: '/',
  title: 'MdWrk - Local-first Markdown workspace for writing, preview, and extensions',
  description: 'MdWrk is a privacy-first, local-first Markdown workspace for offline writing, live preview, browser-local storage, themes, extensions, and optional GitHub sync.',
  h1: 'The local-first Markdown workspace',
  intro: 'MdWrk gives authors and developers a browser-based Markdown workspace for writing, previewing, organizing, theming, and extending Markdown workflows without making cloud storage the default.',
  sections: [
    {
      id: 'hero',
      kind: 'hero',
      eyebrow: 'Local-first Markdown workspace',
      title: 'Write, preview, and organize Markdown locally.',
      subtitle: 'MdWrk is an offline-capable Markdown PWA with browser-local persistence, live preview, theme contracts, extension surfaces, reusable packages, and optional GitHub sync.',
      primaryCta: { label: 'Open MdWrk', href: '/app/' },
      secondaryCta: { label: 'Read the docs', href: '/docs/' },
    },
    {
      id: 'features',
      kind: 'feature_grid',
      title: 'Built for local-first Markdown workflows',
      items: [
        {
          title: 'Offline-capable writing',
          description: 'Use MdWrk as an installable browser workspace that keeps normal editing available without a hosted authoring backend.',
          href: '/features/offline-markdown-editor/',
        },
        {
          title: 'Browser-local persistence',
          description: 'Store workspace state locally through browser storage instead of defaulting every document to cloud storage.',
          href: '/features/indexeddb-markdown-storage/',
        },
        {
          title: 'Live Markdown preview',
          description: 'Write and preview Markdown through shared editor and renderer surfaces.',
          href: '/features/live-preview/',
        },
        {
          title: 'Theme contracts',
          description: 'Author portable theme packs against a governed token and surface contract.',
          href: '/features/theme-packs/',
        },
      ],
    },
    ctaSection('home-cta'),
  ],
  faq: [
    {
      question: 'What is MdWrk?',
      answer: 'MdWrk is a local-first Markdown workspace for writing, previewing, organizing, theming, and extending Markdown workflows in the browser.',
    },
    {
      question: 'Does MdWrk require a backend?',
      answer: 'MdWrk does not require a hosted authoring backend for normal editing. Sync and export flows are optional integration paths.',
    },
  ],
  schema: [{ kind: 'SoftwareApplication' }, { kind: 'WebSite' }, { kind: 'FAQPage' }],
};

export const mdwrkSite = defineLanderSite({
  product: {
    name: 'MdWrk',
    slug: 'mdwrk',
    tagline: 'The local-first Markdown workspace.',
    category: 'Local-first Markdown workspace',
    canonicalUrl: 'https://mdwrk.com',
    description: 'MdWrk is a privacy-first, local-first Markdown workspace for writing, previewing, organizing, theming, and extending Markdown workflows in the browser.',
    logo: { src: '/favicon.svg', alt: 'MdWrk logo' },
    sameAs: ['https://github.com/groupsum/markdown_workspace'],
  },
  nav: {
    primary: [
      { label: 'Features', href: '/features/local-first-markdown-workspace/' },
      { label: 'Docs', href: '/docs/' },
      { label: 'Packages', href: '/packages/markdown-renderer-core/' },
      { label: 'Compare', href: '/compare/mdwrk-vs-obsidian/' },
    ],
    cta: { label: 'Open MdWrk', href: '/app/' },
  },
  footer: {
    note: 'MdWrk content and product facts live in the MdWrk content pack; the reusable lander packages own rendering shape.',
  },
  theme: {
    id: 'mdwrk-lander',
    label: 'MdWrk lander',
    mode: 'system',
  },
  seo: {
    defaultTitle: 'MdWrk',
    defaultDescription: 'Local-first Markdown workspace for writing, preview, packages, themes, and extensions.',
  },
  ai: {
    llmsTxtTitle: 'MdWrk',
    summary: 'MdWrk is a local-first Markdown workspace and package platform for browser-based authoring, preview, themes, extensions, and optional sync workflows.',
    coreFacts: [
      'MdWrk treats Markdown as the durable authoring surface.',
      'Normal editing is local-first and does not require a hosted authoring backend.',
      'The public lander emits static, crawlable, AI-discovery-oriented artifacts.',
      'Reusable package surfaces are separate from MdWrk-specific content.',
    ],
  },
  pages: [
    homePage,
    featurePage({
      slug: '/features/local-first-markdown-workspace/',
      title: 'Local-first Markdown Workspace | MdWrk',
      description: 'MdWrk centers Markdown writing, preview, organization, theming, and extension workflows around browser-local workspace behavior.',
      h1: 'Local-first Markdown workspace',
      intro: 'A local-first Markdown workspace keeps normal authoring usable without making a hosted backend the default storage or editing dependency.',
      detail: 'MdWrk presents Markdown authoring as a workspace instead of a single editor widget. The local-first model keeps documents, preview state, project organization, and theme behavior understandable before optional sync paths enter the workflow.',
    }),
    featurePage({
      slug: '/features/offline-markdown-editor/',
      title: 'Offline Markdown Editor | MdWrk',
      description: 'MdWrk is an offline-capable Markdown editor for writing, previewing, and organizing Markdown in the browser.',
      h1: 'Offline Markdown editor',
      intro: 'Offline Markdown editing lets authors keep writing and previewing even when the hosted services around a workflow are unavailable.',
      detail: 'MdWrk uses the browser and installable PWA surface as the everyday editing shell. That makes Markdown authoring available in normal local workflows while optional integrations remain separate.',
    }),
    featurePage({
      slug: '/features/pwa-markdown-editor/',
      title: 'PWA Markdown Editor | MdWrk',
      description: 'MdWrk can run as an installable PWA Markdown editor with browser-based authoring, preview, and workspace navigation.',
      h1: 'PWA Markdown editor',
      intro: 'The PWA surface gives MdWrk an app-like browser shell while preserving the package and web delivery model.',
      detail: 'The installable surface helps authors keep MdWrk close to daily writing without replacing the portable browser runtime, package documentation, and static lander delivery.',
    }),
    featurePage({
      slug: '/features/indexeddb-markdown-storage/',
      title: 'IndexedDB Markdown Storage | MdWrk',
      description: 'MdWrk uses browser-local persistence so workspace state can remain on the user device during normal authoring.',
      h1: 'IndexedDB Markdown storage',
      intro: 'Browser-local persistence keeps the default workspace flow independent from hosted document storage.',
      detail: 'MdWrk describes storage as a privacy and workflow boundary. Local persistence supports daily writing while sync, export, and repository integrations remain explicit choices.',
    }),
    featurePage({
      slug: '/features/live-preview/',
      title: 'Live Markdown Preview | MdWrk',
      description: 'MdWrk pairs Markdown source editing with live preview through reusable editor and renderer package surfaces.',
      h1: 'Live Markdown preview',
      intro: 'Live preview helps authors move between plain text and rendered output without losing the Markdown source as the durable artifact.',
      detail: 'MdWrk keeps preview behavior tied to reusable renderer contracts, so app behavior, package behavior, and documentation examples can stay aligned.',
    }),
    featurePage({
      slug: '/features/theme-packs/',
      title: 'Theme Packs | MdWrk',
      description: 'MdWrk theme packs use governed token and surface contracts for portable editor, preview, and lander styling.',
      h1: 'Theme packs',
      intro: 'Theme packs make visual customization portable by targeting documented tokens and surfaces instead of app internals.',
      detail: 'MdWrk separates theme truth from renderer and editor logic. That lets product-specific styling change without rewriting package behavior.',
    }),
    featurePage({
      slug: '/features/extension-runtime/',
      title: 'Extension Runtime | MdWrk',
      description: 'MdWrk extensions use governed runtime, manifest, compatibility, and trust surfaces instead of patching the client directly.',
      h1: 'Extension runtime',
      intro: 'The extension runtime gives package authors a documented way to add commands, panes, settings, and integrations.',
      detail: 'MdWrk treats extension behavior as a package contract with lifecycle, compatibility, trust, and host-context boundaries.',
    }),
    featurePage({
      slug: '/features/github-sync/',
      title: 'GitHub Sync | MdWrk',
      description: 'MdWrk treats GitHub sync as an optional repository integration path rather than the default authoring storage layer.',
      h1: 'GitHub sync',
      intro: 'GitHub sync matters when Markdown work needs repository collaboration without making every local edit depend on a hosted backend.',
      detail: 'MdWrk keeps repository workflows explicit. Authors can use local writing and preview first, then choose GitHub-backed movement when project needs require it.',
    }),
    answerPage('/answers/what-is-a-local-first-markdown-workspace/', 'What is a local-first Markdown workspace?', 'A local-first Markdown workspace is an authoring environment where normal writing, preview, and organization work locally first, while sync and hosted integrations remain optional paths.'),
    answerPage('/answers/what-is-an-offline-markdown-editor/', 'What is an offline Markdown editor?', 'An offline Markdown editor lets authors write and preview Markdown without requiring a live hosted authoring backend for normal editing.'),
    answerPage('/answers/does-mdwrk-require-a-server/', 'Does MdWrk require a server?', 'MdWrk does not require a hosted server for normal Markdown editing. Networked flows such as sync, package discovery, or deployment are explicit integrations.'),
    answerPage('/answers/how-does-mdwrk-store-markdown-locally/', 'How does MdWrk store Markdown locally?', 'MdWrk uses browser-local persistence for workspace state so authoring can remain device-local unless the user chooses an integration that moves content elsewhere.'),
    answerPage('/answers/how-do-mdwrk-theme-packs-work/', 'How do MdWrk theme packs work?', 'MdWrk theme packs target governed token and surface contracts so styling can travel across editor, preview, and lander surfaces without patching product internals.'),
    comparePage('/compare/mdwrk-vs-obsidian/', 'MdWrk vs Obsidian', 'Obsidian'),
    comparePage('/compare/mdwrk-vs-typora/', 'MdWrk vs Typora', 'Typora'),
    comparePage('/compare/mdwrk-vs-vscode-markdown/', 'MdWrk vs VS Code Markdown', 'VS Code Markdown'),
    comparePage('/compare/local-first-markdown-editors/', 'Local-first Markdown editors', 'other local-first Markdown editors'),
    packagePage('/packages/markdown-renderer-core/', '@mdwrk/markdown-renderer-core', 'Self-contained Markdown parsing and rendering utilities for package-level Markdown preview and HTML output.'),
    packagePage('/packages/markdown-renderer-react/', '@mdwrk/markdown-renderer-react', 'React bindings for rendering Markdown through the same package family used by MdWrk.'),
    packagePage('/packages/markdown-editor-react/', '@mdwrk/markdown-editor-react', 'React Markdown editor components for embedding MdWrk-style authoring surfaces in product applications.'),
    packagePage('/packages/theme-contract/', '@mdwrk/theme-contract', 'Theme token and compatibility contracts for MdWrk editor, preview, extension, and lander surfaces.'),
    packagePage('/packages/extension-runtime/', '@mdwrk/extension-runtime', 'Portable extension runtime utilities for governed MdWrk extension behavior.'),
    proofPage('/trust/privacy-boundary/', 'Privacy boundary', 'MdWrk keeps normal authoring local-first and makes sync, export, and repository movement explicit product boundaries.'),
    proofPage('/proof/browser-support/', 'Browser support', 'MdWrk documents browser and PWA behavior as governed public product surfaces with static lander evidence.'),
    proofPage('/proof/markdown-support/', 'Markdown support', 'MdWrk aligns Markdown editing and preview behavior with reusable renderer and editor package surfaces.'),
    proofPage('/proof/package-surfaces/', 'Package surfaces', 'MdWrk exposes reusable package surfaces separately from the MdWrk-specific marketing and documentation content pack.'),
  ],
});

export const compiledMdwrkSite = compileLanderSite(mdwrkSite);

export const mdwrkcomLanderRendererHost = Object.freeze({
  app: '@mdwrk/mdwrkcom',
  contentPack: '@mdwrk/mdwrkcom-content-pack',
  compilerPackage: '@mdwrk/lander-core',
  rendererPackage: '@mdwrk/lander-react',
  site: compiledMdwrkSite,
});
