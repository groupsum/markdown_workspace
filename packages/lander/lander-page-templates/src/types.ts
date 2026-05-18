import type {
  ComponentIntentSpec,
  NavItem,
  PageKind,
  PageSpec,
  SchemaSpec,
  SectionSpec,
  StructuredDataIntentKind,
} from "@mdwrk/lander-content-contract";

export type {
  ComponentIntentSpec,
  NavItem,
  PageKind,
  PageSpec,
  SchemaSpec,
  SectionSpec,
  StructuredDataIntentKind,
} from "@mdwrk/lander-content-contract";

export type PageTemplateId = string;
export type PageInstanceId = string;
export type TemplateDomain = "core" | "product" | "support" | "education" | "docs" | "package" | "trust" | (string & {});

export type TemplateRelationshipKind =
  | "contains"
  | "part_of"
  | "links_to"
  | "references"
  | "related"
  | "previous"
  | "next"
  | "parent"
  | "child"
  | "hub_detail"
  | "legal"
  | "support"
  | "faq_question"
  | "course_module"
  | "module_quiz"
  | (string & {});

export type LinkSlotCardinality = "one" | "many" | "optional_one" | "optional_many";
export type TemplateDiagnosticLevel = "error" | "warning";
export type RelationshipRole = "tree_child" | "navigation" | "semantic";
export type ChildPolicy = "required" | "optional" | "terminal";

export interface ChildSlotDefinition {
  id: string;
  relationship: TemplateRelationshipKind;
  targetTemplateIds?: PageTemplateId[];
  min?: number;
  max?: number;
  ordered?: boolean;
}

export interface TemplateTopology {
  childPolicy: ChildPolicy;
  childSlots?: ChildSlotDefinition[];
}

export interface LinkSlotDefinition {
  id: string;
  label?: string;
  relationship: TemplateRelationshipKind;
  role?: RelationshipRole;
  targetTemplateIds?: PageTemplateId[];
  cardinality?: LinkSlotCardinality;
  min?: number;
  max?: number;
  ordered?: boolean;
}

export interface RelationshipRule {
  id: string;
  relationship: TemplateRelationshipKind;
  role?: RelationshipRole;
  sourceTemplateIds?: PageTemplateId[];
  targetTemplateIds?: PageTemplateId[];
  minTargets?: number;
  maxTargets?: number;
  ordered?: boolean;
  slotId?: string;
}

export interface TemplateRenderContext<TData extends Record<string, unknown> = Record<string, unknown>> {
  instance: PageInstance<TData>;
  template: PageTemplate<TData>;
  graph: TemplateGraph;
  links: ResolvedLinkSlots;
  navigation: TemplateNavigation;
}

export interface PageTemplate<TData extends Record<string, unknown> = Record<string, unknown>> {
  id: PageTemplateId;
  domain: TemplateDomain;
  kind: PageKind;
  title: string;
  description?: string;
  linkSlots?: LinkSlotDefinition[];
  topology?: TemplateTopology;
  rules?: RelationshipRule[];
  buildPage: (context: TemplateRenderContext<TData>) => PageSpec;
  schema?: (context: TemplateRenderContext<TData>) => SchemaSpec[];
  componentIntents?: (context: TemplateRenderContext<TData>) => ComponentIntentSpec[];
}

export interface PageInstance<TData extends Record<string, unknown> = Record<string, unknown>> {
  id: PageInstanceId;
  templateId: PageTemplateId;
  slug: string;
  title: string;
  description: string;
  data: TData;
  order?: number;
  href?: string;
  label?: string;
}

export interface TemplateEdge {
  id?: string;
  sourceId: PageInstanceId;
  targetId: PageInstanceId;
  relationship: TemplateRelationshipKind;
  role?: RelationshipRole;
  slotId?: string;
  order?: number;
  label?: string;
}

export interface ResolvedTemplateLink {
  id: string;
  sourceId: PageInstanceId;
  targetId: PageInstanceId;
  relationship: TemplateRelationshipKind;
  role: RelationshipRole;
  slotId: string;
  href: string;
  label: string;
  order: number;
  targetTemplateId: PageTemplateId;
}

export type ResolvedLinkSlots = Record<string, ResolvedTemplateLink[]>;
export type IncomingLinkSlots = Record<string, ResolvedTemplateLink[]>;

export interface TemplateNavigation {
  breadcrumbs: NavItem[];
  related: NavItem[];
  previous?: NavItem;
  next?: NavItem;
  incoming: IncomingLinkSlots;
}

export interface TemplateBundle {
  id: string;
  domain: TemplateDomain;
  title: string;
  templates: PageTemplate[];
  rules?: RelationshipRule[];
}

export interface TemplateGraph {
  templates: PageTemplate[];
  instances: PageInstance[];
  edges: TemplateEdge[];
  bundles?: TemplateBundle[];
  rules?: RelationshipRule[];
}

export interface TemplateDiagnostic {
  level: TemplateDiagnosticLevel;
  code: string;
  message: string;
  instanceId?: PageInstanceId;
  templateId?: PageTemplateId;
  edgeId?: string;
}

export interface TemplateBuildResult {
  pages: PageSpec[];
  diagnostics: TemplateDiagnostic[];
}

export type PageTemplateSourceKind = "imperative" | "markdown";

export interface PageTemplateSourcePage<TData extends Record<string, unknown> = Record<string, unknown>> {
  id: PageInstanceId;
  templateId: PageTemplateId;
  slug: string;
  title: string;
  description: string;
  data?: TData;
  order?: number;
  href?: string;
  label?: string;
  body?: string;
  sourcePath?: string;
}

export interface PageTemplateSourceLink {
  sourceId: PageInstanceId;
  targetId: PageInstanceId;
  relationship?: TemplateRelationshipKind;
  role?: RelationshipRole;
  slotId?: string;
  order?: number;
  label?: string;
  sourcePath?: string;
}

export interface PageTemplateSourceDocument {
  kind?: PageTemplateSourceKind;
  id?: string;
  templates?: PageTemplate[];
  bundles?: TemplateBundle[];
  rules?: RelationshipRule[];
  pages: PageTemplateSourcePage[];
  links?: PageTemplateSourceLink[];
}

export interface MarkdownPageTemplateSourceFile {
  path?: string;
  raw: string;
}

export interface MarkdownPageTemplateCompileInput {
  files: MarkdownPageTemplateSourceFile[];
  templates?: PageTemplate[];
  bundles?: TemplateBundle[];
  rules?: RelationshipRule[];
  id?: string;
}

export interface CompiledPageTemplateRoute {
  slug: string;
  pageId: PageInstanceId;
  templateId: PageTemplateId;
  title: string;
}

export interface CompiledPageTemplateGraphManifest {
  id?: string;
  routes: CompiledPageTemplateRoute[];
  edges: ResolvedTemplateLink[];
  terminalPageIds: PageInstanceId[];
}

export interface PageTemplateCompileResult extends TemplateBuildResult {
  graph: TemplateGraph;
  manifest: CompiledPageTemplateGraphManifest;
}

export interface GeneratedPageTemplateContentPack {
  packageName: string;
  version: string;
  graph: TemplateGraph;
  pages: readonly PageSpec[];
  diagnostics: readonly TemplateDiagnostic[];
  routes: readonly CompiledPageTemplateRoute[];
  manifest: CompiledPageTemplateGraphManifest;
}

export interface DomainTemplateData extends Record<string, unknown> {
  eyebrow?: string;
  intro?: string;
  body?: string;
  summary?: string;
  sections?: SectionSpec[];
  faq?: { question: string; answer: string }[];
  schemaKinds?: StructuredDataIntentKind[];
}
