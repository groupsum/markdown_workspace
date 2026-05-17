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
import type { CompiledLanderSite, CompiledPage, CompiledStructuredDataIntent } from "@mdwrk/lander-core";
import {
  aggregateRatingNode,
  articleNode,
  blogPostingNode,
  bookNode,
  breadcrumbListSchema,
  claimReviewNode,
  courseInstanceNode,
  courseNode,
  datasetNode,
  discussionForumPostingNode,
  employerAggregateRatingNode,
  estimatedSalaryNode,
  eventNode,
  faqPageSchema,
  howToNode,
  imageObjectSchema,
  itemListNode,
  jobPostingNode,
  jsonLdGraph,
  localBusinessNode,
  loyaltyProgramNode,
  mathSolverNode,
  merchantReturnPolicyNode,
  movieNode,
  offerShippingDetailsNode,
  organizationNode,
  productNode,
  productGroupNode,
  qaPageSchema,
  readActionNode,
  recipeNode,
  reviewNode,
  profilePageNode,
  speakableSpecificationNode,
  softwareApplicationNode,
  softwareSourceCodeNode,
  stableId,
  techArticleNode,
  videoObjectNode,
  vacationRentalNode,
  vehicleListingNode,
  webApplicationNode,
  webPageSchema,
  webSiteSchema,
  type JsonLd,
  type AggregateRatingInput,
  type ArticleInput,
  type BookInput,
  type BreadcrumbListInput,
  type ClaimReviewInput,
  type CourseInput,
  type CourseInstanceInput,
  type DatasetInput,
  type DiscussionForumPostingInput,
  type EventInput,
  type FaqPageInput,
  type HowToInput,
  type ImageObjectInput,
  type ItemListInput,
  type JobPostingInput,
  type LocalBusinessInput,
  type LoyaltyProgramInput,
  type MathSolverInput,
  type MovieInput,
  type OrganizationInput,
  type PolicyInput,
  type ProductInput,
  type ProductGroupInput,
  type ProfilePageInput,
  type QaPageInput,
  type RecipeInput,
  type ReviewInput,
  type SoftwareApplicationInput,
  type SoftwareSourceCodeInput,
  type SpeakableInput,
  type VacationRentalInput,
  type VehicleInput,
  type VideoObjectInput,
  type WebPageInput,
  type WebSiteInput,
} from "@mdwrk/structured-data";
import { LANDER_REACT_VERSION } from "./version.js";

export { LANDER_REACT_VERSION };

export interface BreadcrumbListItem {
  label: string;
  href?: string;
}

export interface BreadcrumbListProps {
  items: BreadcrumbListItem[];
  className?: string;
  label?: string;
  listClassName?: string;
  itemClassName?: string;
  linkClassName?: string;
  currentClassName?: string;
}

export interface FaqPageProps {
  items: FaqItem[];
  heading?: string;
  headingId?: string;
  className?: string;
  headingClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  questionClassName?: string;
  answerContainerClassName?: string;
  answerClassName?: string;
  collapsible?: boolean;
}

function cx(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function JsonLd({ graph }: { graph: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />;
}

function StructuredDataNode<T>({ data, build }: { data: T; build: (data: T) => JsonLd }) {
  return <JsonLd graph={build(data)} />;
}

export function WebPageStructuredData({ data }: { data: WebPageInput }) {
  return <StructuredDataNode data={data} build={webPageSchema} />;
}

export function WebSiteStructuredData({ data }: { data: WebSiteInput }) {
  return <StructuredDataNode data={data} build={webSiteSchema} />;
}

export function OrganizationStructuredData({ data }: { data: OrganizationInput }) {
  return <StructuredDataNode data={data} build={organizationNode} />;
}

export function SoftwareApplicationStructuredData({ data }: { data: SoftwareApplicationInput }) {
  return <StructuredDataNode data={data} build={softwareApplicationNode} />;
}

export function WebApplicationStructuredData({ data }: { data: SoftwareApplicationInput }) {
  return <StructuredDataNode data={data} build={webApplicationNode} />;
}

export function ArticleStructuredData({ data }: { data: ArticleInput }) {
  return <StructuredDataNode data={data} build={articleNode} />;
}

export function TechArticleStructuredData({ data }: { data: ArticleInput }) {
  return <StructuredDataNode data={data} build={techArticleNode} />;
}

export function BlogPostingStructuredData({ data }: { data: ArticleInput }) {
  return <StructuredDataNode data={data} build={blogPostingNode} />;
}

export function BreadcrumbListStructuredData({ data }: { data: BreadcrumbListInput }) {
  return <StructuredDataNode data={data} build={breadcrumbListSchema} />;
}

export function FAQPageStructuredData({ data }: { data: FaqPageInput }) {
  return <StructuredDataNode data={data} build={faqPageSchema} />;
}

export function QAPageStructuredData({ data }: { data: QaPageInput }) {
  return <StructuredDataNode data={data} build={qaPageSchema} />;
}

export function HowToStructuredData({ data }: { data: HowToInput }) {
  return <StructuredDataNode data={data} build={howToNode} />;
}

export function ItemListStructuredData({ data }: { data: ItemListInput }) {
  return <StructuredDataNode data={data} build={itemListNode} />;
}

export function SoftwareSourceCodeStructuredData({ data }: { data: SoftwareSourceCodeInput }) {
  return <StructuredDataNode data={data} build={softwareSourceCodeNode} />;
}

export function ProductStructuredData({ data }: { data: ProductInput }) {
  return <StructuredDataNode data={data} build={productNode} />;
}

export function DatasetStructuredData({ data }: { data: DatasetInput }) {
  return <StructuredDataNode data={data} build={datasetNode} />;
}

export function EventStructuredData({ data }: { data: EventInput }) {
  return <StructuredDataNode data={data} build={eventNode} />;
}

export function VideoObjectStructuredData({ data }: { data: VideoObjectInput }) {
  return <StructuredDataNode data={data} build={videoObjectNode} />;
}

export function ImageObjectStructuredData({ data }: { data: ImageObjectInput }) {
  return <StructuredDataNode data={data} build={imageObjectSchema} />;
}

export function ProfilePageStructuredData({ data }: { data: ProfilePageInput }) {
  return <StructuredDataNode data={data} build={profilePageNode} />;
}

export function ReviewStructuredData({ data }: { data: ReviewInput }) {
  return <StructuredDataNode data={data} build={reviewNode} />;
}

export function AggregateRatingStructuredData({ data }: { data: AggregateRatingInput }) {
  return <StructuredDataNode data={data} build={aggregateRatingNode} />;
}

export function CourseStructuredData({ data }: { data: CourseInput }) {
  return <StructuredDataNode data={data} build={courseNode} />;
}

export function CourseInstanceStructuredData({ data }: { data: CourseInstanceInput }) {
  return <StructuredDataNode data={data} build={courseInstanceNode} />;
}

export function DiscussionForumPostingStructuredData({ data }: { data: DiscussionForumPostingInput }) {
  return <StructuredDataNode data={data} build={discussionForumPostingNode} />;
}

export function BookStructuredData({ data }: { data: BookInput }) {
  return <StructuredDataNode data={data} build={bookNode} />;
}

export function ReadActionStructuredData({ target }: { target: string | JsonLd }) {
  return <JsonLd graph={readActionNode(target)} />;
}

export function ClaimReviewStructuredData({ data }: { data: ClaimReviewInput }) {
  return <StructuredDataNode data={data} build={claimReviewNode} />;
}

export function EmployerAggregateRatingStructuredData({ data }: { data: AggregateRatingInput }) {
  return <StructuredDataNode data={data} build={employerAggregateRatingNode} />;
}

export function MonetaryAmountDistributionStructuredData({
  data,
}: {
  data: { name?: string; currency?: string; minValue?: number; maxValue?: number; unitText?: string };
}) {
  return <JsonLd graph={estimatedSalaryNode(data)} />;
}

export function JobPostingStructuredData({ data }: { data: JobPostingInput }) {
  return <StructuredDataNode data={data} build={jobPostingNode} />;
}

export function LocalBusinessStructuredData({ data }: { data: LocalBusinessInput }) {
  return <StructuredDataNode data={data} build={localBusinessNode} />;
}

export function MemberProgramStructuredData({ data }: { data: LoyaltyProgramInput }) {
  return <StructuredDataNode data={data} build={loyaltyProgramNode} />;
}

export function MathSolverStructuredData({ data }: { data: MathSolverInput }) {
  return <StructuredDataNode data={data} build={mathSolverNode} />;
}

export function MerchantReturnPolicyStructuredData({ data }: { data: PolicyInput }) {
  return <StructuredDataNode data={data} build={merchantReturnPolicyNode} />;
}

export function OfferShippingDetailsStructuredData({ data }: { data: PolicyInput }) {
  return <StructuredDataNode data={data} build={offerShippingDetailsNode} />;
}

export function MovieStructuredData({ data }: { data: MovieInput }) {
  return <StructuredDataNode data={data} build={movieNode} />;
}

export function ProductGroupStructuredData({ data }: { data: ProductGroupInput }) {
  return <StructuredDataNode data={data} build={productGroupNode} />;
}

export function RecipeStructuredData({ data }: { data: RecipeInput }) {
  return <StructuredDataNode data={data} build={recipeNode} />;
}

export function SpeakableSpecificationStructuredData({ data }: { data: SpeakableInput }) {
  return <StructuredDataNode data={data} build={speakableSpecificationNode} />;
}

export function VacationRentalStructuredData({ data }: { data: VacationRentalInput }) {
  return <StructuredDataNode data={data} build={vacationRentalNode} />;
}

export function VehicleStructuredData({ data }: { data: VehicleInput }) {
  return <StructuredDataNode data={data} build={vehicleListingNode} />;
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

export interface StructuredDataIntentRendererEntry {
  componentName: string;
  render: (intent: CompiledStructuredDataIntent) => React.ReactElement;
}

function renderDataIntent<T extends object>(
  Component: React.ComponentType<{ data: T }>,
  intent: CompiledStructuredDataIntent,
): React.ReactElement {
  return <Component data={dataRecord(intent.data) as T} />;
}

export const landerStructuredDataIntentRegistry = Object.freeze({
  AggregateRating: { componentName: "AggregateRatingStructuredData", render: (intent) => renderDataIntent(AggregateRatingStructuredData, intent) },
  Article: { componentName: "ArticleStructuredData", render: (intent) => renderDataIntent(ArticleStructuredData, intent) },
  BlogPosting: { componentName: "BlogPostingStructuredData", render: (intent) => renderDataIntent(BlogPostingStructuredData, intent) },
  Book: { componentName: "BookStructuredData", render: (intent) => renderDataIntent(BookStructuredData, intent) },
  BreadcrumbList: { componentName: "BreadcrumbListStructuredData", render: (intent) => renderDataIntent(BreadcrumbListStructuredData, intent) },
  ClaimReview: { componentName: "ClaimReviewStructuredData", render: (intent) => renderDataIntent(ClaimReviewStructuredData, intent) },
  Course: { componentName: "CourseStructuredData", render: (intent) => renderDataIntent(CourseStructuredData, intent) },
  CourseInstance: { componentName: "CourseInstanceStructuredData", render: (intent) => renderDataIntent(CourseInstanceStructuredData, intent) },
  Dataset: { componentName: "DatasetStructuredData", render: (intent) => renderDataIntent(DatasetStructuredData, intent) },
  DiscussionForumPosting: { componentName: "DiscussionForumPostingStructuredData", render: (intent) => renderDataIntent(DiscussionForumPostingStructuredData, intent) },
  EmployerAggregateRating: { componentName: "EmployerAggregateRatingStructuredData", render: (intent) => renderDataIntent(EmployerAggregateRatingStructuredData, intent) },
  Event: { componentName: "EventStructuredData", render: (intent) => renderDataIntent(EventStructuredData, intent) },
  FAQPage: { componentName: "FAQPageStructuredData", render: (intent) => renderDataIntent(FAQPageStructuredData, intent) },
  HowTo: { componentName: "HowToStructuredData", render: (intent) => renderDataIntent(HowToStructuredData, intent) },
  ImageObject: { componentName: "ImageObjectStructuredData", render: (intent) => renderDataIntent(ImageObjectStructuredData, intent) },
  ItemList: { componentName: "ItemListStructuredData", render: (intent) => renderDataIntent(ItemListStructuredData, intent) },
  JobPosting: { componentName: "JobPostingStructuredData", render: (intent) => renderDataIntent(JobPostingStructuredData, intent) },
  LocalBusiness: { componentName: "LocalBusinessStructuredData", render: (intent) => renderDataIntent(LocalBusinessStructuredData, intent) },
  MathSolver: { componentName: "MathSolverStructuredData", render: (intent) => renderDataIntent(MathSolverStructuredData, intent) },
  MemberProgram: { componentName: "MemberProgramStructuredData", render: (intent) => renderDataIntent(MemberProgramStructuredData, intent) },
  MerchantReturnPolicy: { componentName: "MerchantReturnPolicyStructuredData", render: (intent) => renderDataIntent(MerchantReturnPolicyStructuredData, intent) },
  MonetaryAmountDistribution: { componentName: "MonetaryAmountDistributionStructuredData", render: (intent) => renderDataIntent(MonetaryAmountDistributionStructuredData, intent) },
  Movie: { componentName: "MovieStructuredData", render: (intent) => renderDataIntent(MovieStructuredData, intent) },
  OfferShippingDetails: { componentName: "OfferShippingDetailsStructuredData", render: (intent) => renderDataIntent(OfferShippingDetailsStructuredData, intent) },
  Organization: { componentName: "OrganizationStructuredData", render: (intent) => renderDataIntent(OrganizationStructuredData, intent) },
  Product: { componentName: "ProductStructuredData", render: (intent) => renderDataIntent(ProductStructuredData, intent) },
  ProductGroup: { componentName: "ProductGroupStructuredData", render: (intent) => renderDataIntent(ProductGroupStructuredData, intent) },
  ProfilePage: { componentName: "ProfilePageStructuredData", render: (intent) => renderDataIntent(ProfilePageStructuredData, intent) },
  QAPage: { componentName: "QAPageStructuredData", render: (intent) => renderDataIntent(QAPageStructuredData, intent) },
  ReadAction: {
    componentName: "ReadActionStructuredData",
    render: (intent) => <ReadActionStructuredData target={jsonLdValue(dataRecord(intent.data).target) ?? dataRecord(intent.data)} />,
  },
  Recipe: { componentName: "RecipeStructuredData", render: (intent) => renderDataIntent(RecipeStructuredData, intent) },
  Review: { componentName: "ReviewStructuredData", render: (intent) => renderDataIntent(ReviewStructuredData, intent) },
  SoftwareApplication: { componentName: "SoftwareApplicationStructuredData", render: (intent) => renderDataIntent(SoftwareApplicationStructuredData, intent) },
  SoftwareSourceCode: { componentName: "SoftwareSourceCodeStructuredData", render: (intent) => renderDataIntent(SoftwareSourceCodeStructuredData, intent) },
  SpeakableSpecification: { componentName: "SpeakableSpecificationStructuredData", render: (intent) => renderDataIntent(SpeakableSpecificationStructuredData, intent) },
  TechArticle: { componentName: "TechArticleStructuredData", render: (intent) => renderDataIntent(TechArticleStructuredData, intent) },
  VacationRental: { componentName: "VacationRentalStructuredData", render: (intent) => renderDataIntent(VacationRentalStructuredData, intent) },
  Vehicle: { componentName: "VehicleStructuredData", render: (intent) => renderDataIntent(VehicleStructuredData, intent) },
  VideoObject: { componentName: "VideoObjectStructuredData", render: (intent) => renderDataIntent(VideoObjectStructuredData, intent) },
  WebApplication: { componentName: "WebApplicationStructuredData", render: (intent) => renderDataIntent(WebApplicationStructuredData, intent) },
  WebPage: { componentName: "WebPageStructuredData", render: (intent) => renderDataIntent(WebPageStructuredData, intent) },
  WebSite: { componentName: "WebSiteStructuredData", render: (intent) => renderDataIntent(WebSiteStructuredData, intent) },
} satisfies Record<string, StructuredDataIntentRendererEntry>);

export function renderStructuredDataIntent(intent: CompiledStructuredDataIntent): React.ReactElement {
  const entry = landerStructuredDataIntentRegistry[intent.kind];
  if (!entry) throw new Error(`Unsupported structured data intent kind: ${intent.kind}`);
  return entry.render(intent);
}

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

export function FaqPage({
  items,
  heading = "Frequently Asked Questions",
  headingId = "faq-heading",
  className = "lander-page__section",
  headingClassName,
  listClassName = "lander-page__grid",
  itemClassName = "lander-page__card",
  questionClassName,
  answerContainerClassName,
  answerClassName,
  collapsible = false,
}: FaqPageProps) {
  if (!items.length) return null;
  return (
    <section className={className} aria-labelledby={headingId}>
      <h2 id={headingId} className={headingClassName}>{heading}</h2>
      <div className={listClassName}>
        {items.map((item) => collapsible ? (
          <details className={itemClassName} key={item.question}>
            <summary className={questionClassName}>{item.question}</summary>
            <div className={answerContainerClassName}>
              <p className={answerClassName}>{item.answer}</p>
            </div>
          </details>
        ) : (
          <article className={itemClassName} key={item.question}>
            <h3 className={questionClassName}>{item.question}</h3>
            <div className={answerContainerClassName}>
              <p className={answerClassName}>{item.answer}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function FaqBlock({ items }: { items: FaqItem[] }) {
  return <FaqPage items={items} />;
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

export function BreadcrumbList({
  items,
  className,
  label = "Breadcrumb",
  listClassName,
  itemClassName,
  linkClassName,
  currentClassName,
}: BreadcrumbListProps) {
  if (!items.length) return null;
  return (
    <nav aria-label={label} className={cx("lander-breadcrumbs", className)}>
      <ol className={cx("lander-breadcrumbs__list", listClassName)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.href ?? item.label}-${index}`} className={cx("lander-breadcrumbs__item", itemClassName)}>
              {item.href && !isLast ? (
                <a href={item.href} className={cx("lander-breadcrumbs__link", linkClassName)}>
                  {item.label}
                </a>
              ) : (
                <span className={cx("lander-breadcrumbs__current", currentClassName)} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Breadcrumbs({ page }: { page: CompiledPage }) {
  return <BreadcrumbList items={page.breadcrumbs} />;
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
      {page.sections.map((section) => (
        <React.Fragment key={section.id}>
          <SectionRenderer section={section} />
        </React.Fragment>
      ))}
      {page.faq?.length ? <FaqBlock items={page.faq} /> : null}
    </PageShell>
  );
}

function assertNever(value: never): never {
  throw new Error(`Unsupported section: ${JSON.stringify(value)}`);
}
