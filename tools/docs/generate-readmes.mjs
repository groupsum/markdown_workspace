import fs from "node:fs";
import path from "node:path";
import { getLegacyPackageMigration } from "../release/legacy-package-migration.mjs";

const root = process.cwd();
const rootPkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const repoUrl = "https://github.com/groupsum/markdown_workspace";
const repoSlug = "groupsum/markdown_workspace";
const npmOrgUrl = "https://www.npmjs.com/org/mdwrk";
const nodeBadge = "20.x%20%7C%2021.x%20%7C%2022.x";
const rootLicenseLink = "LICENSE";
const rootPackageLink = "package.json";
const commonInstall = ["npm install"];
const commonNodeSupport = "Node.js 20.x through 22.x, matching the workspace engine contract in the root package manifest.";

function rel(from, to) {
  return path.posix.relative(path.posix.dirname(from), to).replaceAll("\\", "/");
}

function writeReadme(relPath, content) {
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, `${content.trim()}\n`, "utf8");
}

function pageId(relPath) {
  return `groupsum.markdown_workspace.${relPath.replaceAll("/", ".").replaceAll("-", "_").replaceAll(".md", "").replaceAll(".", "_")}`;
}

function blobUrl(relPath) {
  return `${repoUrl}/blob/master/${relPath}`;
}

function badgeBlock({ relPath, title, subtitle, downloadsBadge, downloadsHref, extraBadges = [] }) {
  const licenseHref = rel(relPath, rootLicenseLink);
  const packageHref = rel(relPath, rootPackageLink);
  return [
    '<div align="center">',
    "",
    `# ${title}`,
    "",
    subtitle ? `**${subtitle}**` : "",
    "",
    `[![Hits](https://visitor-badge.laobi.icu/badge?page_id=${pageId(relPath)}&left_text=hits)](${blobUrl(relPath)})`,
    downloadsBadge ? `[![Downloads](${downloadsBadge})](${downloadsHref})` : "",
    `[![Node](https://img.shields.io/badge/node-${nodeBadge}-339933?logo=node.js&logoColor=white)](${packageHref})`,
    `[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](${licenseHref})`,
    ...extraBadges,
    "",
    "</div>",
  ].filter(Boolean).join("\n");
}

function npmBadges(pkgName) {
  const encoded = encodeURIComponent(pkgName);
  return {
    downloadsBadge: `https://img.shields.io/npm/dm/${encoded}?label=downloads`,
    downloadsHref: `https://www.npmjs.com/package/${pkgName}`,
  };
}

function repoBadges() {
  return {
    downloadsBadge: `https://img.shields.io/github/downloads/${repoSlug}/total?label=downloads`,
    downloadsHref: `${repoUrl}/releases`,
  };
}

function section(title, body) {
  return `## ${title}\n${body.trim()}`;
}

function bullets(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function links(items) {
  return bullets(items.map(({ label, href, note }) => `[${label}](${href})${note ? ` - ${note}` : ""}`));
}

function code(lang, value) {
  return `\`\`\`${lang}\n${value.trim()}\n\`\`\``;
}

function maintenanceStatusSection(pkgName) {
  const migration = getLegacyPackageMigration(pkgName);
  if (!migration) {
    return null;
  }

  const targetRepoLabel = migration.targetRepo.endsWith("/mdwrk-pages") ? "`groupsum/mdwrk-pages`" : "`groupsum/mdwrk`";
  return section("Maintenance Status", [
    "This is a legacy bridge package in `groupsum/markdown_workspace`.",
    "",
    bullets([
      `Active maintenance moved to ${targetRepoLabel}.`,
      `Install compatibility remains on the same npm package name: \`${pkgName}\`.`,
      `Repository source of truth: [${migration.targetUrl}](${migration.targetUrl})`,
      "Bridge releases from this repo emit an install-time deprecation warning so downstream users can migrate without an immediate package rename.",
    ]),
  ].join("\n"));
}

function publicPackageReadme(config) {
  const { relPath, title, subtitle, summary, why, what, install, usage, related, extraSections = [] } = config;
  const pkg = JSON.parse(fs.readFileSync(path.join(root, path.dirname(relPath), "package.json"), "utf8"));
  const badges = npmBadges(pkg.name);
  const maintenanceSection = maintenanceStatusSection(pkg.name);
  return [
    badgeBlock({ relPath, title, subtitle, ...badges }),
    "",
    summary,
    ...(maintenanceSection ? ["", maintenanceSection] : []),
    "",
    section("Why", why),
    "",
    section("What", bullets(what)),
    "",
    section("Installation", [commonNodeSupport, "", code("bash", install.join("\n"))].join("\n")),
    "",
    section("Usage", usage),
    ...extraSections.flatMap((value) => ["", value]),
    "",
    section("Related", related),
  ].join("\n");
}

function workspaceSurfaceReadme(config) {
  const { relPath, title, subtitle, summary, why, what, install, usage, related, extraSections = [] } = config;
  const badges = repoBadges();
  return [
    badgeBlock({ relPath, title, subtitle, ...badges }),
    "",
    summary,
    "",
    section("Why", why),
    "",
    section("What", bullets(what)),
    "",
    section("Installation", [commonNodeSupport, "", code("bash", install.join("\n"))].join("\n")),
    "",
    section("Usage", usage),
    ...extraSections.flatMap((value) => ["", value]),
    "",
    section("Related", related),
  ].join("\n");
}

function indexReadme(config) {
  const { relPath, title, subtitle, summary, why, what, install, usage, related, repoScoped = true, extraSections = [] } = config;
  const badges = repoScoped ? repoBadges() : npmBadges(config.packageName);
  return [
    badgeBlock({ relPath, title, subtitle, ...badges }),
    "",
    summary,
    "",
    section("Why", why),
    "",
    section("What", bullets(what)),
    "",
    section("Installation", [commonNodeSupport, "", code("bash", install.join("\n"))].join("\n")),
    "",
    section("Usage", usage),
    ...extraSections.flatMap((value) => ["", value]),
    "",
    section("Related", related),
  ].join("\n");
}

const readmes = new Map();

readmes.set("README.md", workspaceSurfaceReadme({
  relPath: "README.md",
  title: "MdWrk",
  subtitle: "Markdown workspace platform",
  summary:
    "MdWrk is a multi-package workspace for markdown authoring, rendering, in-place editing, extension runtime delivery, lander publishing, and repository governance.",
  why:
    "The repo is organized like the strongest public package READMEs: start with the product promise, show how to install and run it quickly, then make the package graph and docs easy to navigate. This README is the front door for the repo, not just a file inventory.",
  what: [
    "Application surfaces for the MdWrk client, desktop shell, public marketing site, and a legacy bridge release line for extracted `@mdwrk/*` packages now maintained in `groupsum/mdwrk` and `groupsum/mdwrk-pages`.",
    "Governed documentation, SSOT specs, conformance scripts, release tooling, and generated evidence lanes.",
    "Example apps that validate public package consumption outside the first-party apps.",
  ],
  install: [
    "npm install",
    "npm run build",
  ],
  usage: [
    "Use the workspace root when you want the full platform:",
    "",
    code("bash", [
      "npm run dev:client",
      "npm run dev:mdwrkcom",
      "npm run test",
      "npm run conformance",
    ].join("\n")),
    "",
    "Start from the package indexes below when you want one surface instead of the whole repo.",
  ].join("\n"),
  related: links([
    { label: "Apps", href: "./apps/client/README.md", note: "client app entrypoint" },
    { label: "Desktop Shell", href: "./apps/desktop/README.md", note: "Electron and Capacitor wrapper" },
    { label: "Public Site", href: "./apps/mdwrkcom/README.md", note: "mdwrk.com app" },
    { label: "Packages Index", href: "./packages/README.md", note: "all reusable package families" },
    { label: "Docs Index", href: "./docs/README.md", note: "architecture, conformance, and operations" },
    { label: "Examples", href: "./examples/README.md", note: "public package consumption examples" },
    { label: "Tooling", href: "./tools/README.md", note: "CI, release, and governance scripts" },
    { label: "npm org", href: npmOrgUrl, note: "published package scope" },
  ]),
  extraSections: [
    section("Repo Transition", bullets([
      "Active maintenance for reusable renderer, editor, contract, extension, shared, and lander packages moved into the extracted repos `groupsum/mdwrk` and `groupsum/mdwrk-pages`.",
      "This repository now carries a legacy bridge release line for those packages so npm consumers can continue installing the same `@mdwrk/*` names during the migration window.",
      "The MdWrk applications and `@mdwrk/mdwrkcom-content-pack` remain maintained here.",
    ])),
    "",
    section("How", bullets([
      "`apps/` contains deployable surfaces.",
      "`packages/` contains the app-local packages plus the legacy bridge packages that redirect maintenance to the extracted repos.",
      "`docs/` contains architecture, conformance, and release guidance.",
      "`tools/` contains the automation that keeps the repo reproducible and certifiable.",
      "`examples/` proves the package API shape from an external-consumer perspective.",
    ])),
  ],
}));

readmes.set(".changeset/README.md", workspaceSurfaceReadme({
  relPath: ".changeset/README.md",
  title: "MdWrk Changesets",
  subtitle: "Release note and versioning workspace",
  summary:
    "This directory stores Changesets entries that drive workspace version planning, grouped release notes, and publish-time version bumps.",
  why:
    "High-quality package repos explain how releases are prepared, not just how code is built. This README keeps the versioning lane discoverable for maintainers.",
  what: [
    "Changeset markdown files that describe package-facing changes.",
    "Inputs to `npm run release:status` and `npm run release:version`.",
    "Release metadata for grouped SemVer movement across the MdWrk package graph.",
  ],
  install: [
    "npm install",
    "npm run release:status",
  ],
  usage: [
    "Create or inspect release notes with Changesets from the workspace root.",
    "",
    code("bash", [
      "npx @changesets/cli",
      "npm run release:status",
      "npm run release:version",
    ].join("\n")),
  ].join("\n"),
  related: links([
    { label: "Root README", href: "../README.md", note: "repo overview" },
    { label: "Operations docs", href: "../docs/README.md", note: "release and support policy" },
    { label: "Tooling", href: "../tools/README.md", note: "release scripts" },
  ]),
}));

readmes.set("docs/README.md", indexReadme({
  relPath: "docs/README.md",
  title: "MdWrk Docs",
  subtitle: "Architecture, conformance, and operations",
  summary:
    "The docs tree explains how MdWrk is structured, what is currently implemented, how conformance is measured, and how releases are prepared and governed.",
  why:
    "Popular project READMEs point readers to the next right document fast. This index is the navigational hub for repo architecture, release policy, and current-state checkpoints.",
  what: [
    "Architecture notes for packages, themes, extensions, lander surfaces, and shared primitives.",
    "Conformance and certification guidance for markdown behavior, package boundaries, and release evidence.",
    "Current-state assessments for phase-by-phase implementation checkpoints.",
    "Operations docs for CI/CD, publishing, compatibility, and release automation.",
  ],
  install: commonInstall,
  usage: [
    "Read the docs alongside the relevant README surface:",
    "",
    bullets([
      "[Architecture](./architecture/package-topology.md) for package graph and boundaries.",
      "[Conformance](./conformance/package-documentation-phase11.md) for documentation expectations and evidence lanes.",
      "[Operations](./operations/release-automation.md) for publish and release flow.",
      "[Current state](./current-state/certifiability-phase-1-honest-scope.md) for the latest honest implementation checkpoint.",
    ]),
  ].join("\n"),
  related: links([
    { label: "Root README", href: "../README.md", note: "repo-level overview" },
    { label: "Packages Index", href: "../packages/README.md", note: "family-level package navigation" },
    { label: "Tooling", href: "../tools/README.md", note: "scripts that enforce these docs" },
  ]),
}));

readmes.set("tools/README.md", indexReadme({
  relPath: "tools/README.md",
  title: "MdWrk Tooling",
  subtitle: "CI, release, conformance, and governance scripts",
  summary:
    "This directory contains the scripts that build, validate, package, sign, and certify the MdWrk workspace.",
  why:
    "Strong engineering READMEs explain the operational surface clearly. This README makes it obvious where CI, release, extension, and governance automation live.",
  what: [
    "`tools/ci/` for build matrices, smoke lanes, and workflow helpers.",
    "`tools/conformance/` for validation, evidence generation, and package-boundary checks.",
    "`tools/extensions/` for installable extension bundle generation, signing, and verification.",
    "`tools/release/` for packaging, publish support, and release evidence.",
    "`tools/governance/` for tree, doc-pointer, and SSOT graph validation.",
  ],
  install: commonInstall,
  usage: [
    "Run the main workspace lanes from the root package manifest.",
    "",
    code("bash", [
      "npm run ci:governance",
      "npm run conformance",
      "npm run release:prepare",
    ].join("\n")),
  ].join("\n"),
  related: links([
    { label: "Root README", href: "../README.md", note: "repo overview" },
    { label: "Docs", href: "../docs/README.md", note: "operations and conformance context" },
    { label: "Packages", href: "../packages/README.md", note: "consumable library surfaces" },
  ]),
}));

readmes.set("packages/README.md", indexReadme({
  relPath: "packages/README.md",
  title: "MdWrk Packages",
  subtitle: "Reusable package catalog",
  summary:
    "The `packages/` tree contains the reusable MdWrk libraries that power authoring, rendering, theming, extensions, lander delivery, and shared primitives.",
  why:
    "Well-trafficked package repos treat the package map like a product catalog. This index helps readers move from the repo overview to the exact family or package they need.",
  what: [
    "`contracts/`, `renderer/`, `editor/`, `extensions/`, and most `shared/` packages now bridge to extracted maintenance repos while keeping the same npm package names.",
    "`lander/`, `@mdwrk/structured-data`, and `@mdwrk/page-template-demo-content-pack` bridge to `groupsum/mdwrk-pages`.",
    "`@mdwrk/mdwrkcom-content-pack` remains maintained here with the mdwrk.com application surface.",
  ],
  install: [
    "npm install",
    "npm run build",
  ],
  usage: [
    "Pick a family first, then move to a concrete package README for install and API details.",
    "",
    bullets([
      "[Contracts](./contracts/README.md)",
      "[Renderer](./renderer/README.md)",
      "[Editor](./editor/README.md)",
      "[Extensions](./extensions/README.md)",
      "[Shared](./shared/README.md)",
      "[Lander](./lander/README.md)",
      "[Content](./content/README.md)",
    ]),
  ].join("\n"),
  related: links([
    { label: "Root README", href: "../README.md", note: "repo overview" },
    { label: "Examples", href: "../examples/README.md", note: "external-consumer validation" },
    { label: "npm org", href: npmOrgUrl, note: "published package scope" },
  ]),
  extraSections: [
    section("Maintenance Status", bullets([
      "Use the package READMEs in this repo as legacy bridge docs for packages that have moved.",
      "The active source repos are `groupsum/mdwrk` for renderer/editor/contracts/extensions/shared packages and `groupsum/mdwrk-pages` for lander, structured-data, and page-template-demo-content-pack packages.",
      "`@mdwrk/mdwrkcom-content-pack` is the primary package in this repo that remains maintained here.",
    ])),
  ],
}));

readmes.set("packages/contracts/README.md", indexReadme({
  relPath: "packages/contracts/README.md",
  title: "MdWrk Contracts",
  subtitle: "Theme and extension API foundations",
  summary:
    "The contracts family defines the stable type and capability boundaries shared by MdWrk themes, extension manifests, and extension hosts.",
  why:
    "Consumers need to know where the durable API contract starts. This family README separates contract packages from runtime and UI implementations.",
  what: [
    "`@mdwrk/extension-manifest` for manifest, capability, settings, integrity, and compatibility shapes.",
    "`@mdwrk/extension-host` for the host-side API available to extensions at runtime.",
    "`@mdwrk/theme-contract` for stable theme tokens, class names, bridges, and preset compatibility.",
  ],
  install: [
    "npm install @mdwrk/extension-manifest @mdwrk/extension-host @mdwrk/theme-contract",
  ],
  usage: [
    "Use these packages when you are defining compatibility, not when you are running the runtime.",
    "",
    bullets([
      "[extension-manifest](./extension-manifest/README.md) for package metadata and capabilities.",
      "[extension-host](./extension-host/README.md) for host APIs exposed to extensions.",
      "[theme-contract](./theme-contract/README.md) for theme token and class guarantees.",
    ]),
  ].join("\n"),
  related: links([
    { label: "Extensions family", href: "../extensions/README.md", note: "runtime and bundled extensions" },
    { label: "Shared family", href: "../shared/README.md", note: "token and i18n consumers" },
  ]),
}));

readmes.set("packages/renderer/README.md", indexReadme({
  relPath: "packages/renderer/README.md",
  title: "MdWrk Renderer",
  subtitle: "Markdown parsing and React rendering",
  summary:
    "The renderer family turns markdown into HTML and React-rendered output using the same core parsing surface across packages and apps.",
  why:
    "Consumers often want a headless rendering core or a React wrapper. This family README makes the split explicit and cross-linked.",
  what: [
    "`@mdwrk/markdown-renderer-core` for parsing, profile handling, headings, and HTML document generation.",
    "`@mdwrk/markdown-renderer-react` for React rendering with theme styles and link interception.",
  ],
  install: [
    "npm install @mdwrk/markdown-renderer-core @mdwrk/markdown-renderer-react",
  ],
  usage: [
    "Start with the core package for server-side or non-React use. Move to the React package when you need a component surface.",
    "",
    bullets([
      "[markdown-renderer-core](./markdown-renderer-core/README.md)",
      "[markdown-renderer-react](./markdown-renderer-react/README.md)",
    ]),
  ].join("\n"),
  related: links([
    { label: "Editor family", href: "../editor/README.md", note: "editing surfaces built on the renderer" },
    { label: "Examples", href: "../../examples/renderer-basic/README.md", note: "standalone renderer example" },
  ]),
}));

readmes.set("packages/editor/README.md", indexReadme({
  relPath: "packages/editor/README.md",
  title: "MdWrk Editor",
  subtitle: "Source-mode and in-renderer editing",
  summary:
    "The editor family provides headless markdown editing logic, a React source editor, and an in-renderer block editing surface.",
  why:
    "The editing stack has three layers, and good README navigation should show where state, UI, and in-place editing responsibilities split.",
  what: [
    "`@mdwrk/markdown-editor-core` for commands, transforms, selections, and history.",
    "`@mdwrk/markdown-editor-react` for the textarea-based source editor component.",
    "`@mdwrk/markdown-edit-in-renderer-react` for block activation inside rendered markdown.",
  ],
  install: [
    "npm install @mdwrk/markdown-editor-core @mdwrk/markdown-editor-react @mdwrk/markdown-edit-in-renderer-react",
  ],
  usage: [
    "Pick the thinnest editing layer you need, then move up the stack only when the UX requires it.",
    "",
    bullets([
      "[markdown-editor-core](./markdown-editor-core/README.md)",
      "[markdown-editor-react](./markdown-editor-react/README.md)",
      "[markdown-edit-in-renderer-react](./markdown-edit-in-renderer-react/README.md)",
    ]),
  ].join("\n"),
  related: links([
    { label: "Renderer family", href: "../renderer/README.md", note: "rendering surfaces paired with these editors" },
    { label: "Examples", href: "../../examples/editor-basic/README.md", note: "standalone editor example" },
  ]),
}));

readmes.set("packages/extensions/README.md", indexReadme({
  relPath: "packages/extensions/README.md",
  title: "MdWrk Extensions",
  subtitle: "Runtime and first-party bundled extensions",
  summary:
    "The extensions family contains the runtime that loads MdWrk extensions and the first-party bundled packages that register views, actions, and services.",
  why:
    "Extension ecosystems need clear boundaries between contracts, runtime, and concrete packages. This family README points readers to the right layer immediately.",
  what: [
    "`@mdwrk/extension-runtime` for loading, compatibility, activation, storage, and catalog workflows.",
    "First-party bundled packages for workspace files, Git operations, extension management, Gemini workflows, theme authoring, language packs, and catalog validation.",
  ],
  install: [
    "npm install @mdwrk/extension-runtime @mdwrk/extension-manager @mdwrk/extension-workspace-files",
  ],
  usage: [
    "Use the runtime when you are building or hosting extensions. Use the individual package READMEs when you need a specific bundled capability.",
    "",
    bullets([
      "[extension-runtime](./extension-runtime/README.md)",
      "[extension-manager](./extension-manager/README.md)",
      "[extension-workspace-files](./extension-workspace-files/README.md)",
      "[extension-git-ops](./extension-git-ops/README.md)",
      "[extension-gemini-agent](./extension-gemini-agent/README.md)",
      "[extension-theme-studio](./extension-theme-studio/README.md)",
      "[extension-language-pack-studio](./extension-language-pack-studio/README.md)",
      "[extension-catalog-hello](./extension-catalog-hello/README.md)",
    ]),
  ].join("\n"),
  related: links([
    { label: "Contracts family", href: "../contracts/README.md", note: "manifest, host, and theme API contracts" },
    { label: "Client app", href: "../../apps/client/README.md", note: "first-party extension host" },
  ]),
}));

readmes.set("packages/shared/README.md", indexReadme({
  relPath: "packages/shared/README.md",
  title: "MdWrk Shared",
  subtitle: "Tokens, icons, i18n, testing, and discovery helpers",
  summary:
    "The shared family holds the primitives reused across MdWrk packages, apps, themes, and public-site generation.",
  why:
    "Good package repos keep primitives discoverable and separate from feature packages. This index shows what is intentionally shared across the workspace.",
  what: [
    "`@mdwrk/ui-tokens` for token defaults and class-facing theme data.",
    "`@mdwrk/icons` for workspace icon identifiers and metadata.",
    "`@mdwrk/i18n` for locale catalogs and runtime formatting helpers.",
    "`@mdwrk/testing` for lightweight browser and timing test utilities.",
    "`@mdwrk/structured-data` for Schema.org and JSON-LD builders.",
  ],
  install: [
    "npm install @mdwrk/ui-tokens @mdwrk/icons @mdwrk/i18n @mdwrk/testing @mdwrk/structured-data",
  ],
  usage: [
    "Pull these packages into apps and higher-level libraries when you need stable primitives instead of app-specific implementations.",
    "",
    bullets([
      "[ui-tokens](./ui-tokens/README.md)",
      "[icons](./icons/README.md)",
      "[i18n](./i18n/README.md)",
      "[testing](./testing/README.md)",
      "[structured-data](./structured-data/README.md)",
    ]),
  ].join("\n"),
  related: links([
    { label: "Contracts family", href: "../contracts/README.md", note: "theme contract and extension types" },
    { label: "Lander family", href: "../lander/README.md", note: "consumers of structured-data helpers" },
  ]),
}));

readmes.set("packages/lander/README.md", indexReadme({
  relPath: "packages/lander/README.md",
  title: "MdWrk Lander",
  subtitle: "Portable content, compile, SEO, theme, and React surfaces",
  summary:
    "The lander family packages the content model, compilation pipeline, SEO output, theme defaults, markdown adapters, and React components used for product landing sites.",
  why:
    "The lander stack is intentionally modular. This index separates content contracts, compile-time logic, output helpers, and runtime rendering.",
  what: [
    "`@mdwrk/lander-content-contract` for site, page, section, and schema shapes.",
    "`@mdwrk/lander-core` for compile, validation, sitemap, robots, and llms.txt generation.",
    "`@mdwrk/lander-seo` for metadata and scoring helpers.",
    "`@mdwrk/lander-theme` for default styles and tokens.",
    "`@mdwrk/lander-react` for UI components and JSON-LD output.",
    "`@mdwrk/lander-markdown-content-adapter` for frontmatter-driven markdown ingestion.",
  ],
  install: [
    "npm install @mdwrk/lander-content-contract @mdwrk/lander-core @mdwrk/lander-seo @mdwrk/lander-theme @mdwrk/lander-react @mdwrk/lander-markdown-content-adapter",
  ],
  usage: [
    "Start with the content contract and core compiler, then add SEO, theming, markdown adapters, or React surfaces as needed.",
    "",
    bullets([
      "[lander-content-contract](./lander-content-contract/README.md)",
      "[lander-core](./lander-core/README.md)",
      "[lander-seo](./lander-seo/README.md)",
      "[lander-theme](./lander-theme/README.md)",
      "[lander-react](./lander-react/README.md)",
      "[lander-markdown-content-adapter](./lander-markdown-content-adapter/README.md)",
    ]),
  ].join("\n"),
  related: links([
    { label: "Content family", href: "../content/README.md", note: "MdWrk content pack" },
    { label: "mdwrk.com app", href: "../../apps/mdwrkcom/README.md", note: "first-party consumer" },
  ]),
}));

readmes.set("packages/content/README.md", indexReadme({
  relPath: "packages/content/README.md",
  title: "MdWrk Content Packs",
  subtitle: "Published content distributions",
  summary:
    "The content family packages source markdown, public assets, sitemap definitions, and generated discovery artifacts for MdWrk public-site delivery.",
  why:
    "A content pack is not the same thing as the lander runtime. This README makes the distinction clear and points to the package that ships content itself.",
  what: [
    "`@mdwrk/mdwrkcom-content-pack` as the first-party content distribution consumed by the mdwrk.com app and related tooling.",
  ],
  install: [
    "npm install @mdwrk/mdwrkcom-content-pack",
  ],
  usage: [
    "Use the content pack when you need the source content tree and generated discovery assets as a package boundary, not just live files in the repo.",
    "",
    bullets([
      "[mdwrkcom-content-pack](./mdwrkcom-content-pack/README.md)",
    ]),
  ].join("\n"),
  related: links([
    { label: "Lander family", href: "../lander/README.md", note: "runtime and compile surfaces" },
    { label: "mdwrk.com app", href: "../../apps/mdwrkcom/README.md", note: "site consumer" },
  ]),
}));

readmes.set("examples/README.md", indexReadme({
  relPath: "examples/README.md",
  title: "MdWrk Examples",
  subtitle: "Standalone package-consumption examples",
  summary:
    "The examples tree contains small applications that consume MdWrk packages through their public package interfaces rather than private workspace internals.",
  why:
    "Good package ecosystems prove that the published API shape works outside the first-party app. These examples do that validation work.",
  what: [
    "`editor-basic/` for source editing plus renderer integration.",
    "`renderer-basic/` for renderer-only consumption.",
    "A boundary check that reinforces package API usage instead of internal imports.",
  ],
  install: commonInstall,
  usage: [
    code("bash", [
      "npm run build -w @mdwrk/example-renderer-basic",
      "npm run build -w @mdwrk/example-editor-basic",
    ].join("\n")),
  ].join("\n"),
  related: links([
    { label: "Renderer example", href: "./renderer-basic/README.md", note: "renderer package usage" },
    { label: "Editor example", href: "./editor-basic/README.md", note: "editor package usage" },
    { label: "Packages index", href: "../packages/README.md", note: "published package families" },
  ]),
}));

readmes.set("examples/editor-basic/README.md", workspaceSurfaceReadme({
  relPath: "examples/editor-basic/README.md",
  title: "@mdwrk/example-editor-basic",
  subtitle: "Workspace example app",
  summary:
    "This example app demonstrates how to wire the public MdWrk editor and renderer packages together in a consumer-facing project shape.",
  why:
    "It is the quickest way to confirm that source editing, previewing, and public package boundaries work outside the main client application.",
  what: [
    "A small app that consumes the editor and renderer packages through their published entrypoints.",
    "A reference for install, build, and local debugging flow.",
    "Proof that package consumers do not need private client internals to build a usable editing surface.",
  ],
  install: [
    "npm install",
    "npm run build -w @mdwrk/example-editor-basic",
  ],
  usage: [
    "Build the example from the workspace root, then inspect how the public package interfaces are imported.",
    "",
    code("bash", [
      "npm run typecheck -w @mdwrk/example-editor-basic",
      "npm run build -w @mdwrk/example-editor-basic",
    ].join("\n")),
  ].join("\n"),
  related: links([
    { label: "Examples index", href: "../README.md", note: "all examples" },
    { label: "Editor family", href: "../../packages/editor/README.md", note: "editing packages used here" },
    { label: "Renderer family", href: "../../packages/renderer/README.md", note: "preview surface used here" },
  ]),
}));

readmes.set("examples/renderer-basic/README.md", workspaceSurfaceReadme({
  relPath: "examples/renderer-basic/README.md",
  title: "@mdwrk/example-renderer-basic",
  subtitle: "Workspace example app",
  summary:
    "This example app demonstrates direct consumption of the public MdWrk renderer packages without the larger client application shell.",
  why:
    "It keeps the rendering story easy to verify for downstream consumers who only need markdown output, not the full editor or extension host.",
  what: [
    "A standalone example focused on public renderer package APIs.",
    "A small reference target for integration smoke and pack validation.",
    "A minimal way to inspect renderer output and package wiring.",
  ],
  install: [
    "npm install",
    "npm run build -w @mdwrk/example-renderer-basic",
  ],
  usage: [
    code("bash", [
      "npm run typecheck -w @mdwrk/example-renderer-basic",
      "npm run build -w @mdwrk/example-renderer-basic",
    ].join("\n")),
  ].join("\n"),
  related: links([
    { label: "Examples index", href: "../README.md", note: "all examples" },
    { label: "Renderer family", href: "../../packages/renderer/README.md", note: "rendering packages used here" },
  ]),
}));

readmes.set("apps/client/README.md", publicPackageReadme({
  relPath: "apps/client/README.md",
  title: "@mdwrk/mdwrkspace",
  subtitle: "MdWrk client application package",
  summary:
    "`@mdwrk/mdwrkspace` packages the MdWrk browser client: markdown editing, previewing, extension hosting, theme switching, responsive shell layout, and retained-version PWA delivery.",
  why:
    "Consumers evaluating the client need the product story first, then the shell contract and extension/runtime context. This README keeps the package approachable while still linking to the deeper architecture docs.",
  what: [
    "A workspace shell with header, action rail, explorer/sidebar, stage, and footer regions.",
    "Built-in authoring, preview, theme, language, extension, and Git-adjacent surfaces.",
    "A single viewport contract shared across all themes, with theme-specific styling layered on top.",
    "A package-level surface that still cross-links to the repo docs for architecture detail.",
  ],
  install: [
    "npm install @mdwrk/mdwrkspace",
  ],
  usage: [
    "Use the published package when you want the client surface itself, or run it from the workspace while iterating on the repo.",
    "",
    code("bash", [
      "npm install",
      "npm run dev:client",
      "npm run build -w apps/client",
      "npm run screenshots:matrix -w apps/client",
    ].join("\n")),
    "",
    "The canonical viewport contract lives in `client/public/css/base/viewports.css`, and themes are expected to preserve that structural contract while restyling the bands.",
  ].join("\n"),
  related: links([
    { label: "Root README", href: "../../README.md", note: "repo overview" },
    { label: "Desktop shell", href: "../desktop/README.md", note: "native wrapper for this client" },
    { label: "Extensions family", href: "../../packages/extensions/README.md", note: "runtime and bundled extensions" },
    { label: "Theme contract", href: "../../packages/contracts/theme-contract/README.md", note: "theme compatibility surface" },
    { label: "Docs", href: "../../docs/README.md", note: "deeper architecture and conformance" },
  ]),
  extraSections: [
    section("How", bullets([
      "Run `npm run dev:client` for local client iteration.",
      "Run `npm run screenshots:matrix -w apps/client` when you need full theme and viewport coverage artifacts.",
      "Use the extension family packages to understand the bundled runtime and first-party panels.",
    ])),
  ],
}));

readmes.set("apps/desktop/README.md", workspaceSurfaceReadme({
  relPath: "apps/desktop/README.md",
  title: "@mdwrk/desktop",
  subtitle: "Native shell wrapper",
  summary:
    "`@mdwrk/desktop` wraps the MdWrk client for Electron desktop delivery and Capacitor Android packaging.",
  why:
    "The desktop surface is a host wrapper, not a second client implementation. This README makes that relationship explicit and gives maintainers one place for build and distribution commands.",
  what: [
    "Electron packaging for desktop environments.",
    "Capacitor Android packaging on top of the same client build.",
    "A workspace-private surface that depends on the client package and shared release tooling.",
  ],
  install: [
    "npm install",
    "npm run build:desktop",
  ],
  usage: [
    code("bash", [
      "npm run build:desktop",
      "npm run build:desktop:dist",
      "npm run build:android",
    ].join("\n")),
    "",
    "Build the client first if you are debugging the packaged shell manually. The root scripts already encode that dependency chain.",
  ].join("\n"),
  related: links([
    { label: "Client app", href: "../client/README.md", note: "hosted web client" },
    { label: "Root README", href: "../../README.md", note: "repo overview" },
    { label: "Tooling", href: "../../tools/README.md", note: "desktop build and release helpers" },
  ]),
}));

readmes.set("apps/mdwrkcom/README.md", workspaceSurfaceReadme({
  relPath: "apps/mdwrkcom/README.md",
  title: "@mdwrk/mdwrkcom",
  subtitle: "MdWrk public site application",
  summary:
    "`@mdwrk/mdwrkcom` is the deployable app workspace for mdwrk.com, built on the lander and content-pack packages in this repository.",
  why:
    "The public site is both a product surface and the first-party proving ground for the lander packages. This README connects the app to the reusable packages beneath it.",
  what: [
    "A deployable website app, not a reusable library package.",
    "Consumer of the lander content contract, compiler, SEO helpers, React components, and content pack.",
    "Home for mdwrk.com pages, compare pages, docs bridges, blog content, and generated discovery artifacts.",
  ],
  install: [
    "npm install",
    "npm run dev:mdwrkcom",
  ],
  usage: [
    code("bash", [
      "npm run dev -w apps/mdwrkcom",
      "npm run build -w apps/mdwrkcom",
      "npm run ci -w apps/mdwrkcom",
    ].join("\n")),
    "",
    "Treat this app as the first-party integration surface for the lander packages, not the only place the lander stack can be used.",
  ].join("\n"),
  related: links([
    { label: "Lander family", href: "../../packages/lander/README.md", note: "reusable runtime and compile packages" },
    { label: "Content pack", href: "../../packages/content/mdwrkcom-content-pack/README.md", note: "source content distribution" },
    { label: "Root README", href: "../../README.md", note: "repo overview" },
  ]),
}));

const packageConfigs = [
  {
    relPath: "packages/contracts/extension-manifest/README.md",
    title: "@mdwrk/extension-manifest",
    subtitle: "Extension metadata and compatibility contract",
    summary: "This package defines the canonical MdWrk extension manifest shape, including capabilities, contributions, settings, integrity data, and compatibility declarations.",
    why: "Use it when you need to describe an extension package in a durable, host-agnostic way.",
    what: [
      "Manifest structure for bundled and external extensions.",
      "Capability, contribution, settings, i18n, support, integrity, and distribution types.",
      "The package boundary consumed by extension packages, runtimes, and host validators.",
    ],
    install: ["npm install @mdwrk/extension-manifest"],
    usage: code("ts", [
      "import type { ExtensionManifest } from \"@mdwrk/extension-manifest\";",
      "",
      "const manifest: ExtensionManifest = {",
      "  manifestVersion: 1,",
      "  id: \"example.extension\",",
      "  packageName: \"@scope/example-extension\",",
      "  version: \"1.0.0\",",
      "  displayName: { defaultMessage: \"Example Extension\" },",
      "  description: { defaultMessage: \"Demonstrates the manifest contract.\" },",
      "  kind: \"bundled\",",
      "  icon: { kind: \"lucide\", name: \"Plug\" },",
      "  enabledByDefault: true,",
      "  capabilities: [],",
      "  compatibility: { hostApi: \"*\", runtime: \"*\", themeContract: \"*\" },",
      "  entry: { module: \"./index.js\" },",
      "  contributions: {},",
      "};",
    ].join("\n")),
  },
  {
    relPath: "packages/contracts/extension-host/README.md",
    title: "@mdwrk/extension-host",
    subtitle: "Host API surface for MdWrk extensions",
    summary: "This package defines the host APIs that MdWrk extensions can use for commands, views, action rail items, settings, notifications, theme access, editor access, workspace access, i18n, diagnostics, and logging.",
    why: "Use it when you are implementing an extension or a host and need a stable boundary between the two.",
    what: [
      "Type contracts for extension lifecycle and registration.",
      "Host APIs for editor, workspace, theme, views, settings, notifications, diagnostics, and logging.",
      "Primitive interfaces shared by the runtime and bundled extensions.",
    ],
    install: ["npm install @mdwrk/extension-host"],
    usage: code("ts", [
      "import type { ExtensionHost } from \"@mdwrk/extension-host\";",
      "",
      "export function boot(host: ExtensionHost) {",
      "  return host.commands.list();",
      "}",
    ].join("\n")),
  },
  {
    relPath: "packages/contracts/theme-contract/README.md",
    title: "@mdwrk/theme-contract",
    subtitle: "Portable MdWrk theme compatibility surface",
    summary: "This package defines the stable MdWrk theme token, class-name, bridge, and preset compatibility surface used across apps, renderers, editors, and extensions.",
    why: "Use it when you need themes to remain compatible across multiple MdWrk surfaces instead of drifting app by app.",
    what: [
      "Theme preset and draft shapes.",
      "Stable token and class-name contracts.",
      "Bridge metadata used to map token values into target surfaces.",
    ],
    install: ["npm install @mdwrk/theme-contract"],
    usage: code("ts", [
      "import { createEmptyThemePreset } from \"@mdwrk/theme-contract\";",
      "",
      "const preset = createEmptyThemePreset(\"my-theme\", \"My Theme\");",
      "",
      "preset.tokens = {",
      "  \"color.canvas\": \"#111111\",",
      "};",
    ].join("\n")),
  },
  {
    relPath: "packages/renderer/markdown-renderer-core/README.md",
    title: "@mdwrk/markdown-renderer-core",
    subtitle: "Headless markdown rendering core",
    summary: "This package provides self-contained markdown parsing, profile handling, heading extraction, HTML rendering, and full HTML document generation for MdWrk consumers.",
    why: "Use it when you need markdown output without pulling in React.",
    what: [
      "Synchronous and asynchronous markdown-to-HTML rendering helpers.",
      "Heading extraction, slug generation, frontmatter helpers, and profile support.",
      "HTML document generation for standalone output.",
    ],
    install: ["npm install @mdwrk/markdown-renderer-core"],
    usage: code("ts", [
      "import { renderMarkdownToHtmlSync } from \"@mdwrk/markdown-renderer-core\";",
      "",
      "const html = renderMarkdownToHtmlSync(\"# Hello\\n\\nMdWrk renderer core.\", {",
      "  profile: \"gfm-default\",",
      "  htmlHandling: \"escape\",",
      "});",
    ].join("\n")),
  },
  {
    relPath: "packages/renderer/markdown-renderer-react/README.md",
    title: "@mdwrk/markdown-renderer-react",
    subtitle: "React markdown renderer component",
    summary: "This package wraps the MdWrk renderer core in a React component with theme styles and link-interaction hooks.",
    why: "Use it when you want markdown rendering as a React component instead of a headless HTML string pipeline.",
    what: [
      "A `MarkdownRenderer` React component.",
      "Theme-style helpers for renderer output.",
      "Link click interception and attribute injection hooks.",
    ],
    install: ["npm install @mdwrk/markdown-renderer-react @mdwrk/markdown-renderer-core"],
    usage: code("tsx", [
      "import { MarkdownRenderer } from \"@mdwrk/markdown-renderer-react\";",
      "import \"@mdwrk/markdown-renderer-react/styles/default.css\";",
      "",
      "export function Preview() {",
      "  return <MarkdownRenderer markdown={\"# Hello\\n\\nRendered with MdWrk.\"} />;",
      "}",
    ].join("\n")),
  },
  {
    relPath: "packages/editor/markdown-editor-core/README.md",
    title: "@mdwrk/markdown-editor-core",
    subtitle: "Headless markdown editing primitives",
    summary: "This package exposes the command, selection, transform, and history logic behind the MdWrk editing experience.",
    why: "Use it when you need markdown editing semantics without committing to a specific UI implementation.",
    what: [
      "Built-in markdown editing commands.",
      "Selection and transform helpers.",
      "Undo and redo history state management.",
    ],
    install: ["npm install @mdwrk/markdown-editor-core"],
    usage: code("ts", [
      "import { applyBuiltinMarkdownCommand, createSelection } from \"@mdwrk/markdown-editor-core\";",
      "",
      "const result = applyBuiltinMarkdownCommand(",
      "  \"bold\",",
      "  \"hello\",",
      "  createSelection(0, 5),",
      ");",
    ].join("\n")),
  },
  {
    relPath: "packages/editor/markdown-editor-react/README.md",
    title: "@mdwrk/markdown-editor-react",
    subtitle: "React source editor component",
    summary: "This package provides the textarea-based MdWrk source editor component on top of the editor core primitives.",
    why: "Use it when you need a React authoring surface with built-in commands, line numbers, selection handling, and history.",
    what: [
      "A `MarkdownSourceEditor` React component.",
      "Theme-style helpers and public editor types.",
      "Re-exported editor-core primitives for convenience.",
    ],
    install: ["npm install @mdwrk/markdown-editor-react @mdwrk/markdown-editor-core"],
    usage: code("tsx", [
      "import { MarkdownSourceEditor } from \"@mdwrk/markdown-editor-react\";",
      "import \"@mdwrk/markdown-editor-react/styles/default.css\";",
      "",
      "export function Editor() {",
      "  return <MarkdownSourceEditor defaultValue={\"# Draft\\n\\nStart typing...\"} />;",
      "}",
    ].join("\n")),
  },
  {
    relPath: "packages/editor/markdown-edit-in-renderer-react/README.md",
    title: "@mdwrk/markdown-edit-in-renderer-react",
    subtitle: "In-place markdown block editing for React",
    summary: "This package keeps markdown in the rendered document flow, activates individual blocks in place, and emits full-document markdown updates.",
    why: "Use it when you want Typora-style authoring without splitting the document into a separate source-only surface.",
    what: [
      "Rendered markdown with block activation.",
      "Source editor activation only where the user is editing.",
      "Integration with the MdWrk renderer and editor packages instead of a second parsing model.",
    ],
    install: ["npm install @mdwrk/markdown-edit-in-renderer-react @mdwrk/markdown-renderer-react @mdwrk/markdown-editor-react"],
    usage: code("tsx", [
      "import { MarkdownEditInRenderer } from \"@mdwrk/markdown-edit-in-renderer-react\";",
      "import \"@mdwrk/markdown-renderer-react/styles/default.css\";",
      "import \"@mdwrk/markdown-editor-react/styles/default.css\";",
      "import \"@mdwrk/markdown-edit-in-renderer-react/styles/default.css\";",
      "",
      "export function DocumentEditor() {",
      "  return (",
      "    <MarkdownEditInRenderer",
      "      defaultValue={\"# Draft\\n\\nClick a block to edit it.\"}",
      "      onChange={(markdown) => console.log(markdown)}",
      "    />",
      "  );",
      "}",
    ].join("\n")),
  },
  {
    relPath: "packages/extensions/extension-runtime/README.md",
    title: "@mdwrk/extension-runtime",
    subtitle: "Runtime for MdWrk extensions",
    summary: "This package loads, validates, activates, deactivates, catalogs, installs, and tracks MdWrk extensions against the host and contract baselines.",
    why: "Use it when you are building an extension host or testing extension lifecycle behavior.",
    what: [
      "Bundled and installed extension registration.",
      "Compatibility checks against host, runtime, editor, renderer, and theme baselines.",
      "Catalog loading, activation state, diagnostics, storage, and capability trimming.",
    ],
    install: ["npm install @mdwrk/extension-runtime @mdwrk/extension-host @mdwrk/extension-manifest"],
    usage: "Use this package inside a host implementation. Pair it with `@mdwrk/extension-host` and `@mdwrk/extension-manifest` for a complete extension boundary.",
  },
  {
    relPath: "packages/extensions/extension-manager/README.md",
    title: "@mdwrk/extension-manager",
    subtitle: "First-party extension operations console",
    summary: "This package provides the first-party bundled operator console for browsing, enabling, disabling, configuring, and diagnosing MdWrk extensions.",
    why: "Use it when you want a concrete management surface on top of the runtime rather than only the headless runtime APIs.",
    what: [
      "A packaged first-party extension, not the core runtime itself.",
      "Views and UI for extension inventory, state, and diagnostics.",
      "A bundled entry surface consumed by the client host.",
    ],
    install: ["npm install @mdwrk/extension-manager @mdwrk/extension-runtime"],
    usage: "Import this package into a host that already exposes the MdWrk extension runtime and host APIs.",
  },
  {
    relPath: "packages/extensions/extension-workspace-files/README.md",
    title: "@mdwrk/extension-workspace-files",
    subtitle: "Workspace file-system extension",
    summary: "This package provides the first-party extension that backs project and file browsing inside the MdWrk workspace shell.",
    why: "Use it when the host needs the default workspace file experience rather than only custom extension views.",
    what: [
      "Bundled workspace browsing and file operations.",
      "A first-party extension package consumed by the client host.",
      "A reference extension for workspace-centric host APIs.",
    ],
    install: ["npm install @mdwrk/extension-workspace-files @mdwrk/extension-runtime"],
    usage: "Load it as a bundled extension inside a host that implements the MdWrk workspace APIs.",
  },
  {
    relPath: "packages/extensions/extension-git-ops/README.md",
    title: "@mdwrk/extension-git-ops",
    subtitle: "Git workflow extension",
    summary: "This package provides the first-party Git operations extension surface for MdWrk hosts.",
    why: "Use it when you want Git-adjacent workflows exposed through the extension system instead of hard-coding them into the shell.",
    what: [
      "Bundled extension metadata and entrypoints for Git operations.",
      "A first-party package intended to register Git-oriented views and actions.",
      "A reusable extension boundary for hosts that support Git workflows.",
    ],
    install: ["npm install @mdwrk/extension-git-ops @mdwrk/extension-runtime"],
    usage: "Consume it as a bundled extension package inside a host that already provides runtime and workspace services.",
  },
  {
    relPath: "packages/extensions/extension-gemini-agent/README.md",
    title: "@mdwrk/extension-gemini-agent",
    subtitle: "Gemini workflow extension",
    summary: "This package provides the first-party Gemini workflow extension with conversation threads, Markdown preview, draft-based writeback, and a bundled operator view.",
    why: "Use it when you need AI-assisted drafting as an extension surface instead of embedding it directly in the shell.",
    what: [
      "Bundled Gemini agent views and services.",
      "Settings, prompt, provider, and sidebar/view components.",
      "A concrete example of a richer first-party MdWrk extension package.",
    ],
    install: ["npm install @mdwrk/extension-gemini-agent @mdwrk/extension-runtime"],
    usage: "Register the package as a bundled extension in a host that exposes editor, workspace, and notification APIs.",
  },
  {
    relPath: "packages/extensions/extension-theme-studio/README.md",
    title: "@mdwrk/extension-theme-studio",
    subtitle: "Theme authoring extension",
    summary: "This package provides the first-party theme authoring extension for token inspection, preview, apply/revert flow, and export helpers.",
    why: "Use it when you want theme editing to live inside the extension system and remain aligned to the shared token contract.",
    what: [
      "Theme drafting and export helpers.",
      "Bundled views, services, and settings for theme authoring.",
      "A concrete consumer of the theme contract and shared token packages.",
    ],
    install: ["npm install @mdwrk/extension-theme-studio @mdwrk/theme-contract"],
    usage: "Load it into a host that implements the MdWrk theme APIs and wants a first-party authoring panel.",
  },
  {
    relPath: "packages/extensions/extension-language-pack-studio/README.md",
    title: "@mdwrk/extension-language-pack-studio",
    subtitle: "Language-pack authoring extension",
    summary: "This package provides the first-party extension for inspecting and shaping language-pack data inside MdWrk hosts.",
    why: "Use it when localization authoring should remain an extension concern instead of being hard-wired into the app shell.",
    what: [
      "Bundled extension entrypoints and language-pack helpers.",
      "A first-party consumer of the i18n package family and host APIs.",
      "A workspace authoring surface for localization-related workflows.",
    ],
    install: ["npm install @mdwrk/extension-language-pack-studio @mdwrk/i18n"],
    usage: "Load it as a bundled extension in a host with i18n and workspace capabilities.",
  },
  {
    relPath: "packages/extensions/extension-catalog-hello/README.md",
    title: "@mdwrk/extension-catalog-hello",
    subtitle: "External catalog sample extension",
    summary: "This package is a sample external extension used to validate catalog discovery, installation, trust, and runtime activation.",
    why: "Use it when you need a small, auditable example of the external-extension path rather than a large first-party extension.",
    what: [
      "A tiny extension that registers a view and action-rail item.",
      "An installable external-package example for trust and catalog flow.",
      "A simple reference implementation for downstream extension authors.",
    ],
    install: ["npm install @mdwrk/extension-catalog-hello"],
    usage: code("ts", [
      "import extensionCatalogHello from \"@mdwrk/extension-catalog-hello\";",
      "",
      "console.log(extensionCatalogHello.manifest.id);",
    ].join("\n")),
  },
  {
    relPath: "packages/shared/i18n/README.md",
    title: "@mdwrk/i18n",
    subtitle: "Locale registry and message helpers",
    summary: "This package provides shared message descriptors, locale catalogs, loaders, and registry helpers for MdWrk packages and apps.",
    why: "Use it when you need a lightweight i18n layer shared across packages rather than app-specific localization code.",
    what: [
      "Locale registry creation and catalog registration.",
      "Message descriptor normalization and formatting.",
      "Helpers for package-level locale loading and fallback handling.",
    ],
    install: ["npm install @mdwrk/i18n"],
    usage: code("ts", [
      "import { createLocaleRegistry } from \"@mdwrk/i18n\";",
      "",
      "const registry = createLocaleRegistry({ defaultLocale: \"en\" });",
      "registry.registerCatalog({",
      "  locale: \"en\",",
      "  messages: { greeting: { defaultMessage: \"Hello {name}\" } },",
      "});",
      "",
      "registry.resolve({ key: \"greeting\", defaultMessage: \"Hello {name}\" }, { name: \"MdWrk\" });",
    ].join("\n")),
  },
  {
    relPath: "packages/shared/icons/README.md",
    title: "@mdwrk/icons",
    subtitle: "Workspace icon catalog",
    summary: "This package provides stable icon identifiers and metadata for MdWrk applications and packages.",
    why: "Use it when you want icon references to stay semantic and package-safe instead of scattering raw icon names through the codebase.",
    what: [
      "A curated workspace icon id list.",
      "Icon metadata that maps semantic ids to Lucide names and categories.",
      "Shared icon definitions for apps, extensions, and docs-friendly catalogs.",
    ],
    install: ["npm install @mdwrk/icons"],
    usage: code("ts", [
      "import { WORKSPACE_ICON_CATALOG, getWorkspaceIconDefinition } from \"@mdwrk/icons\";",
      "",
      "const icon = getWorkspaceIconDefinition(\"workspace.file\");",
      "console.log(icon?.lucideName, WORKSPACE_ICON_CATALOG.length);",
    ].join("\n")),
  },
  {
    relPath: "packages/shared/testing/README.md",
    title: "@mdwrk/testing",
    subtitle: "Shared test utilities",
    summary: "This package provides lightweight browser and timing helpers reused by MdWrk package tests.",
    why: "Use it when you need small shared test utilities without dragging app-specific test setup into library packages.",
    what: [
      "In-memory storage helpers.",
      "A `matchMedia` stub for browser-like test environments.",
      "Timing helpers shared across package test suites.",
    ],
    install: ["npm install -D @mdwrk/testing"],
    usage: code("ts", [
      "import { createMemoryStorage, installMatchMediaStub } from \"@mdwrk/testing\";",
      "",
      "const storage = createMemoryStorage({ draft: \"# MdWrk\" });",
      "const restore = installMatchMediaStub(false);",
      "",
      "restore();",
    ].join("\n")),
  },
  {
    relPath: "packages/shared/ui-tokens/README.md",
    title: "@mdwrk/ui-tokens",
    subtitle: "Shared token defaults and class helpers",
    summary: "This package exposes the shared MdWrk token defaults, names, and CSS custom-property helpers used across the workspace.",
    why: "Use it when you need token values and names directly without importing the full theme authoring surface.",
    what: [
      "Stable token names and defaults.",
      "CSS custom-property lists for the shared UI contract.",
      "Theme-facing aliases built on top of the theme contract package.",
    ],
    install: ["npm install @mdwrk/ui-tokens"],
    usage: code("ts", [
      "import { MARKDOWN_WORKSPACE_TOKEN_DEFAULTS } from \"@mdwrk/ui-tokens\";",
      "",
      "console.log(MARKDOWN_WORKSPACE_TOKEN_DEFAULTS[\"color.canvas\"]);",
    ].join("\n")),
  },
  {
    relPath: "packages/shared/structured-data/README.md",
    title: "@mdwrk/structured-data",
    subtitle: "Schema.org and JSON-LD helpers",
    summary: "This package provides reusable Schema.org and JSON-LD builders for MdWrk apps, packages, public content, and discovery surfaces.",
    why: "Use it when you need structured-data output without rewriting low-level Schema.org node creation logic.",
    what: [
      "Builders for WebPage, WebSite, FAQPage, SoftwareApplication, TechArticle, Product, Dataset, and more.",
      "Helpers for canonical ids and graph assembly.",
      "A shared discovery layer consumed heavily by the lander stack.",
    ],
    install: ["npm install @mdwrk/structured-data"],
    usage: code("ts", [
      "import { faqPageSchema, jsonLdGraph, softwareApplicationNode } from \"@mdwrk/structured-data\";",
      "",
      "const graph = jsonLdGraph([",
      "  softwareApplicationNode({ name: \"MdWrk\", url: \"https://mdwrk.com\" }),",
      "  faqPageSchema({ items: [{ question: \"What is MdWrk?\", answer: \"A markdown workspace platform.\" }] }),",
      "]);",
    ].join("\n")),
  },
  {
    relPath: "packages/lander/lander-content-contract/README.md",
    title: "@mdwrk/lander-content-contract",
    subtitle: "Portable site and page content types",
    summary: "This package defines the site, page, section, schema, navigation, and FAQ types used by MdWrk lander surfaces.",
    why: "Use it when you need a content shape that is portable across compile-time, render-time, and source-content adapters.",
    what: [
      "Product, page, section, FAQ, schema, and navigation types.",
      "A shared content boundary for the entire lander family.",
      "The contract consumed by the compiler, React package, SEO helpers, and markdown adapter.",
    ],
    install: ["npm install @mdwrk/lander-content-contract"],
    usage: code("ts", [
      "import type { HeroSection, LanderSite } from \"@mdwrk/lander-content-contract\";",
      "",
      "const hero: HeroSection = {",
      "  id: \"hero\",",
      "  kind: \"hero\",",
      "  title: \"MdWrk\",",
      "  subtitle: \"Markdown workspace platform\",",
      "};",
      "",
      "const site: LanderSite = {",
      "  product: {",
      "    name: \"MdWrk\",",
      "    slug: \"mdwrk\",",
      "    tagline: \"Markdown workspace platform\",",
      "    description: \"Portable markdown authoring and publishing.\",",
      "    category: \"DeveloperTool\",",
      "    canonicalUrl: \"https://mdwrk.com\",",
      "  },",
      "  pages: [],",
      "};",
    ].join("\n")),
  },
  {
    relPath: "packages/lander/lander-core/README.md",
    title: "@mdwrk/lander-core",
    subtitle: "Content compiler and diagnostics",
    summary: "This package compiles lander content, validates it, derives breadcrumbs and internal links, and generates sitemap, robots, and llms.txt outputs.",
    why: "Use it when you need the compile-time logic behind a product lander without committing to a UI layer yet.",
    what: [
      "Site definition helpers and validation.",
      "Compiled page metadata such as breadcrumbs, internal links, and word counts.",
      "Sitemap, robots.txt, and llms.txt generation.",
    ],
    install: ["npm install @mdwrk/lander-core @mdwrk/lander-content-contract"],
    usage: code("ts", [
      "import { compileLanderSite, defineLanderSite } from \"@mdwrk/lander-core\";",
      "",
      "const site = defineLanderSite({",
      "  product: {",
      "    name: \"MdWrk\",",
      "    slug: \"mdwrk\",",
      "    tagline: \"Markdown workspace platform\",",
      "    description: \"Portable markdown authoring and publishing.\",",
      "    category: \"DeveloperTool\",",
      "    canonicalUrl: \"https://mdwrk.com\",",
      "  },",
      "  pages: [],",
      "});",
      "",
      "const compiled = compileLanderSite(site);",
    ].join("\n")),
  },
  {
    relPath: "packages/lander/lander-seo/README.md",
    title: "@mdwrk/lander-seo",
    subtitle: "Metadata, scoring, and discovery helpers",
    summary: "This package provides metadata assembly, page scoring, AI summary helpers, and re-exports for sitemap, robots, and llms.txt generation.",
    why: "Use it when you want lander SEO and AI-discovery helpers above the raw compiler output.",
    what: [
      "Page metadata builders.",
      "SEO scoring and diagnostics.",
      "AI summary helpers plus re-exports for crawl/discovery files.",
    ],
    install: ["npm install @mdwrk/lander-seo @mdwrk/lander-core"],
    usage: code("ts", [
      "import { buildAiSummary, buildPageMetadata, scoreSeoPage } from \"@mdwrk/lander-seo\";",
      "",
      "console.log(buildAiSummary);",
      "console.log(buildPageMetadata, scoreSeoPage);",
    ].join("\n")),
  },
  {
    relPath: "packages/lander/lander-theme/README.md",
    title: "@mdwrk/lander-theme",
    subtitle: "Portable lander styles and tokens",
    summary: "This package provides the default theme layer for generic lander components.",
    why: "Use it when you want a baseline visual system for lander components before product-specific styling is layered on top.",
    what: [
      "Portable default styles for lander components.",
      "A shared theme baseline for first-party and downstream lander surfaces.",
      "A styling layer that stays separate from content, compile, and React logic.",
    ],
    install: ["npm install @mdwrk/lander-theme"],
    usage: "Import the package styles into your lander app or component library entrypoint.",
  },
  {
    relPath: "packages/lander/lander-react/README.md",
    title: "@mdwrk/lander-react",
    subtitle: "React components for product landers",
    summary: "This package provides reusable React components for rendering compiled lander pages, breadcrumbs, FAQs, CTA sections, package grids, and JSON-LD graphs.",
    why: "Use it when you want a render-time component layer on top of the lander content contract and compiler outputs.",
    what: [
      "Page shell and section rendering components.",
      "FAQ, breadcrumb, package-grid, and proof-matrix components.",
      "JSON-LD graph rendering wired to compiled site/page input.",
    ],
    install: ["npm install @mdwrk/lander-react @mdwrk/lander-core @mdwrk/lander-content-contract"],
    usage: code("tsx", [
      "import { LanderPage } from \"@mdwrk/lander-react\";",
      "",
      "export function Page({ site, page }) {",
      "  return <LanderPage site={site} page={page} />;",
      "}",
    ].join("\n")),
  },
  {
    relPath: "packages/lander/lander-markdown-content-adapter/README.md",
    title: "@mdwrk/lander-markdown-content-adapter",
    subtitle: "Markdown and frontmatter adapter",
    summary: "This package converts frontmatter-plus-body markdown into lander page specs.",
    why: "Use it when your source of truth is markdown files and you still want to target the lander content contract cleanly.",
    what: [
      "Frontmatter splitting and simple parsing.",
      "Markdown body adaptation into a page-spec structure.",
      "A bridge between source markdown files and the lander compiler.",
    ],
    install: ["npm install @mdwrk/lander-markdown-content-adapter @mdwrk/lander-core"],
    usage: code("ts", [
      "import { markdownToPageSpec } from \"@mdwrk/lander-markdown-content-adapter\";",
      "",
      "const parsed = markdownToPageSpec(\"---\\ntitle: Hello\\nslug: /hello/\\n---\\nMdWrk body copy.\");",
    ].join("\n")),
  },
  {
    relPath: "packages/content/mdwrkcom-content-pack/README.md",
    title: "@mdwrk/mdwrkcom-content-pack",
    subtitle: "MdWrk public-site content distribution",
    summary: "This package distributes the mdwrk.com source content tree, markdown data, public assets, and generated discovery artifacts.",
    why: "Use it when you need the content itself as a package boundary rather than consuming the mdwrk.com app repository structure directly.",
    what: [
      "Source content and markdown data roots.",
      "Sitemap definition path and generated discovery outputs.",
      "Path helpers for consumers that need stable package-relative access.",
    ],
    install: ["npm install @mdwrk/mdwrkcom-content-pack"],
    usage: code("ts", [
      "import { mdwrkcomContentPack, resolveMdwrkcomContentPackPath } from \"@mdwrk/mdwrkcom-content-pack\";",
      "",
      "console.log(mdwrkcomContentPack.generatedArtifacts);",
      "console.log(resolveMdwrkcomContentPackPath(mdwrkcomContentPack.sitemapPath));",
    ].join("\n")),
  },
];

for (const config of packageConfigs) {
  readmes.set(config.relPath, publicPackageReadme({
    ...config,
    related: links([
      { label: "Packages index", href: rel(config.relPath, "packages/README.md"), note: "family and package navigation" },
      { label: "Root README", href: rel(config.relPath, "README.md"), note: "repo overview" },
    ]),
  }));
}

for (const [relPath, content] of readmes.entries()) {
  writeReadme(relPath, content);
}
