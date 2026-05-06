export type PageKind =
  | "home"
  | "feature"
  | "use_case"
  | "answer"
  | "compare"
  | "package"
  | "proof"
  | "pricing"
  | "docs_bridge"
  | "trust";

export type SectionKind =
  | "hero"
  | "feature_grid"
  | "feature_detail"
  | "comparison"
  | "proof_matrix"
  | "package_grid"
  | "pricing"
  | "cta"
  | "faq"
  | "markdown";

export interface AssetRef {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface Cta {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "tertiary";
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface NavSpec {
  primary: NavItem[];
  secondary?: NavItem[];
  cta?: Cta;
}

export interface FooterSpec {
  links?: NavItem[];
  legal?: NavItem[];
  note?: string;
}

export interface ThemeSpec {
  id: string;
  label: string;
  mode?: "light" | "dark" | "system";
  tokens?: Record<string, string>;
}

export interface SiteSeoSpec {
  titleTemplate?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: AssetRef;
}

export interface AiDiscoverySpec {
  summary?: string;
  llmsTxtTitle?: string;
  coreFacts?: string[];
}

export interface ProductIdentity {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  canonicalUrl: string;
  logo?: AssetRef;
  sameAs?: string[];
}

export interface PageSeoSpec {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
  keywords?: string[];
  image?: AssetRef;
}

export interface SchemaSpec {
  kind:
    | "WebPage"
    | "Organization"
    | "WebSite"
    | "SoftwareApplication"
    | "WebApplication"
    | "SoftwareSourceCode"
    | "TechArticle"
    | "Article"
    | "BlogPosting"
    | "FAQPage"
    | "BreadcrumbList"
    | "Dataset"
    | "ImageObject"
    | "ItemList"
    | "HowTo"
    | "Product"
    | "ProfilePage"
    | "VideoObject";
  data?: Record<string, unknown>;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FeatureCard {
  title: string;
  description: string;
  href?: string;
  icon?: string;
}

export interface ComparisonCell {
  label: string;
  value: string;
  tone?: "positive" | "neutral" | "warning";
}

export interface ComparisonColumn {
  id: string;
  label: string;
}

export interface ComparisonRow {
  id: string;
  label: string;
  cells: Record<string, ComparisonCell | string>;
}

export interface ProofItem {
  claim: string;
  status: "planned" | "supported" | "verified" | "not_applicable";
  evidence?: string;
  href?: string;
}

export interface PackageCardSpec {
  name: string;
  description: string;
  install?: string;
  href?: string;
  api?: string[];
}

export interface BaseSection {
  id: string;
  kind: SectionKind;
  title?: string;
}

export interface HeroSection extends BaseSection {
  kind: "hero";
  eyebrow?: string;
  title: string;
  subtitle: string;
  image?: AssetRef;
  primaryCta?: Cta;
  secondaryCta?: Cta;
}

export interface FeatureGridSection extends BaseSection {
  kind: "feature_grid";
  title: string;
  items: FeatureCard[];
}

export interface FeatureDetailSection extends BaseSection {
  kind: "feature_detail";
  title: string;
  body: string;
  items?: FeatureCard[];
}

export interface ComparisonSection extends BaseSection {
  kind: "comparison";
  title: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

export interface ProofMatrixSection extends BaseSection {
  kind: "proof_matrix";
  title: string;
  items: ProofItem[];
}

export interface PackageGridSection extends BaseSection {
  kind: "package_grid";
  title: string;
  packages: PackageCardSpec[];
}

export interface PricingSection extends BaseSection {
  kind: "pricing";
  title: string;
  body: string;
}

export interface CtaSection extends BaseSection {
  kind: "cta";
  title: string;
  body?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
}

export interface FaqSection extends BaseSection {
  kind: "faq";
  title?: string;
  items: FaqItem[];
}

export interface MarkdownSection extends BaseSection {
  kind: "markdown";
  body: string;
}

export type SectionSpec =
  | HeroSection
  | FeatureGridSection
  | FeatureDetailSection
  | ComparisonSection
  | ProofMatrixSection
  | PackageGridSection
  | PricingSection
  | CtaSection
  | FaqSection
  | MarkdownSection;

export interface PageSpec {
  kind: PageKind;
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: SectionSpec[];
  faq?: FaqItem[];
  seo?: PageSeoSpec;
  schema?: SchemaSpec[];
}

export interface LanderSite {
  product: ProductIdentity;
  pages: PageSpec[];
  nav?: NavSpec;
  footer?: FooterSpec;
  theme?: ThemeSpec;
  seo?: SiteSeoSpec;
  ai?: AiDiscoverySpec;
}
