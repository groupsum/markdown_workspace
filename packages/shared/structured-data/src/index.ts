import { LANDER_SCHEMA_VERSION, STRUCTURED_DATA_VERSION } from "./version.js";

export { LANDER_SCHEMA_VERSION, STRUCTURED_DATA_VERSION };

export type JsonLd = Record<string, unknown>;
export type JsonLdNodeType =
  | "WebPage"
  | "WebSite"
  | "Organization"
  | "SoftwareApplication"
  | "WebApplication"
  | "Article"
  | "TechArticle"
  | "BlogPosting"
  | "BreadcrumbList"
  | "FAQPage"
  | "QAPage"
  | "HowTo"
  | "ItemList"
  | "SoftwareSourceCode"
  | "Product"
  | "Dataset"
  | "Event"
  | "VideoObject"
  | "ImageObject"
  | "ProfilePage"
  | "Review"
  | "AggregateRating"
  | "Course"
  | "CourseInstance"
  | "DiscussionForumPosting"
  | "Book"
  | "ReadAction"
  | "ClaimReview"
  | "EmployerAggregateRating"
  | "MonetaryAmountDistribution"
  | "JobPosting"
  | "LocalBusiness"
  | "MemberProgram"
  | "MathSolver"
  | "MerchantReturnPolicy"
  | "OfferShippingDetails"
  | "Movie"
  | "ProductGroup"
  | "Recipe"
  | "SpeakableSpecification"
  | "VacationRental"
  | "Vehicle";

export interface StructuredDataImage {
  src?: string;
  url?: string;
  width?: number;
  height?: number;
  caption?: string;
  alt?: string;
}

export interface StructuredDataProduct {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  category?: string;
  canonicalUrl: string;
  logo?: StructuredDataImage;
  sameAs?: string[];
}

export interface StructuredDataSite {
  product: StructuredDataProduct;
}

export interface StructuredDataBreadcrumbItem {
  label: string;
  href: string;
}

export interface StructuredDataFaqItem {
  question: string;
  answer: string;
}

export interface StructuredDataPage {
  kind?: string;
  slug?: string;
  title: string;
  description?: string;
  h1: string;
  canonicalUrl: string;
  breadcrumbs: StructuredDataBreadcrumbItem[];
  faq?: StructuredDataFaqItem[];
  image?: StructuredDataImage;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}

export interface StructuredDataThingInput {
  id?: string;
  name: string;
  description?: string;
  url?: string;
  image?: string | StructuredDataImage;
}

export interface WebPageInput extends StructuredDataThingInput {
  primaryType?: string;
  mainEntity?: JsonLd | string;
  breadcrumb?: JsonLd | string;
  isPartOf?: JsonLd | string;
  datePublished?: string;
  dateModified?: string;
}

export interface WebSiteInput extends StructuredDataThingInput {
  publisher?: JsonLd | string;
  potentialAction?: JsonLd;
}

export interface OrganizationInput extends StructuredDataThingInput {
  logo?: string | StructuredDataImage;
  sameAs?: string[];
}

export interface SoftwareApplicationInput extends StructuredDataThingInput {
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: JsonLd;
  softwareVersion?: string;
}

export interface ArticleInput extends StructuredDataThingInput {
  headline?: string;
  author?: JsonLd | string;
  publisher?: JsonLd | string;
  datePublished?: string;
  dateModified?: string;
  mainEntityOfPage?: string | JsonLd;
}

export interface BreadcrumbListInput {
  id?: string;
  items: StructuredDataBreadcrumbItem[];
}

export interface FaqPageInput {
  id?: string;
  items: StructuredDataFaqItem[];
}

export interface QaPageInput {
  id?: string;
  question: string;
  answer: string;
  url?: string;
}

export interface HowToStepInput {
  name: string;
  text: string;
  url?: string;
  image?: string | StructuredDataImage;
}

export interface HowToInput extends StructuredDataThingInput {
  steps: HowToStepInput[];
  totalTime?: string;
}

export interface ItemListInput {
  id?: string;
  name: string;
  items: Array<{ name: string; url?: string; item?: JsonLd | string }>;
}

export interface SoftwareSourceCodeInput extends StructuredDataThingInput {
  codeRepository?: string;
  programmingLanguage?: string | string[];
  runtimePlatform?: string;
}

export interface ProductInput extends StructuredDataThingInput {
  brand?: JsonLd | string;
  sku?: string;
  category?: string;
  offers?: JsonLd;
  aggregateRating?: JsonLd;
  review?: JsonLd | JsonLd[];
}

export interface DatasetInput extends StructuredDataThingInput {
  creator?: JsonLd | string;
  distribution?: JsonLd | JsonLd[];
  keywords?: string[];
  datePublished?: string;
  dateModified?: string;
}

export interface EventInput extends StructuredDataThingInput {
  startDate: string;
  endDate?: string;
  eventStatus?: string;
  eventAttendanceMode?: string;
  location?: JsonLd | string;
  organizer?: JsonLd | string;
}

export interface VideoObjectInput extends StructuredDataThingInput {
  thumbnailUrl: string | string[];
  uploadDate: string;
  duration?: string;
  embedUrl?: string;
  contentUrl?: string;
}

export interface ImageObjectInput extends StructuredDataThingInput {
  contentUrl?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface ProfilePageInput extends StructuredDataThingInput {
  mainEntity: JsonLd | string;
}

export interface ReviewInput extends StructuredDataThingInput {
  itemReviewed: JsonLd | string;
  reviewRating?: JsonLd;
  author?: JsonLd | string;
  reviewBody?: string;
}

export interface AggregateRatingInput {
  ratingValue: number | string;
  reviewCount?: number;
  ratingCount?: number;
  bestRating?: number | string;
  worstRating?: number | string;
}

export interface CourseInput extends StructuredDataThingInput {
  provider?: JsonLd | string;
  courseCode?: string;
  coursePrerequisites?: string | string[];
  hasCourseInstance?: JsonLd | JsonLd[];
}

export interface CourseInstanceInput extends StructuredDataThingInput {
  courseMode?: string;
  startDate?: string;
  endDate?: string;
  location?: JsonLd | string;
  instructor?: JsonLd | string;
}

export interface DiscussionForumPostingInput extends StructuredDataThingInput {
  headline?: string;
  author?: JsonLd | string;
  datePublished?: string;
  dateModified?: string;
  articleBody?: string;
}

export interface BookInput extends StructuredDataThingInput {
  author?: JsonLd | string;
  isbn?: string;
  readAction?: JsonLd;
}

export interface ClaimReviewInput extends StructuredDataThingInput {
  claimReviewed: string;
  itemReviewed?: JsonLd | string;
  author?: JsonLd | string;
  reviewRating?: JsonLd;
  datePublished?: string;
}

export interface JobPostingInput extends StructuredDataThingInput {
  title: string;
  datePosted: string;
  validThrough?: string;
  employmentType?: string | string[];
  hiringOrganization: JsonLd | string;
  jobLocation?: JsonLd | string;
  baseSalary?: JsonLd;
}

export interface LocalBusinessInput extends OrganizationInput {
  address?: JsonLd | string;
  telephone?: string;
  priceRange?: string;
  openingHours?: string | string[];
}

export interface LoyaltyProgramInput extends StructuredDataThingInput {
  provider?: JsonLd | string;
}

export interface MathSolverInput extends StructuredDataThingInput {
  mathExpression?: string;
}

export interface PolicyInput extends StructuredDataThingInput {
  merchantReturnDays?: number;
  returnPolicyCategory?: string;
  shippingDestination?: JsonLd | string;
  shippingRate?: JsonLd;
}

export interface MovieInput extends StructuredDataThingInput {
  director?: JsonLd | string;
  actor?: JsonLd | JsonLd[] | string | string[];
  datePublished?: string;
}

export interface ProductGroupInput extends ProductInput {
  hasVariant?: JsonLd | JsonLd[];
  variesBy?: string | string[];
}

export interface RecipeInput extends StructuredDataThingInput {
  recipeIngredient: string[];
  recipeInstructions: string | HowToStepInput[];
  author?: JsonLd | string;
  datePublished?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
}

export interface SpeakableInput {
  cssSelector?: string[];
  xpath?: string[];
}

export interface PaywalledContentInput extends WebPageInput {
  cssSelector?: string[];
}

export interface VacationRentalInput extends StructuredDataThingInput {
  address?: JsonLd | string;
  containsPlace?: JsonLd | JsonLd[];
}

export interface VehicleInput extends ProductInput {
  vehicleIdentificationNumber?: string;
  vehicleModelDate?: string;
  mileageFromOdometer?: JsonLd;
}

const SCHEMA_CONTEXT = "https://schema.org";

const compact = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const entries = value.map(compact).filter((entry) => entry !== undefined);
    return entries.length ? entries : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, entry]) => {
      const compacted = compact(entry);
      if (compacted !== undefined && compacted !== null && compacted !== "") acc[key] = compacted;
      return acc;
    }, {});
    return Object.keys(entries).length ? entries : undefined;
  }
  return value;
};

const requireText = (value: string | undefined, field: string): string => {
  if (!value?.trim()) throw new Error(`Missing required structured data field: ${field}`);
  return value;
};

const node = (type: JsonLdNodeType, value: Record<string, unknown>): JsonLd =>
  compact({
    "@context": SCHEMA_CONTEXT,
    "@type": type,
    ...value,
  }) as JsonLd;

export const stableId = (canonicalUrl: string, fragment: string): string =>
  `${canonicalUrl.replace(/[#/]+$/, "")}#${fragment.replace(/^#+/, "")}`;

const imageValue = (image: string | StructuredDataImage | undefined): string | JsonLd | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  const url = image.url ?? image.src;
  if (!url) return undefined;
  return imageObjectSchema({
    name: image.alt ?? image.caption ?? "Image",
    url,
    contentUrl: url,
    width: image.width,
    height: image.height,
    caption: image.caption,
  });
};

const personOrOrganizationRef = (value: JsonLd | string | undefined): JsonLd | string | undefined =>
  typeof value === "string" ? node("Organization", { name: value }) : value;

export function webPageSchema(input: WebPageInput): JsonLd {
  return node("WebPage", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    headline: input.name,
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    mainEntity: input.mainEntity,
    breadcrumb: input.breadcrumb,
    isPartOf: input.isPartOf,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
  });
}

export function webSiteSchema(input: WebSiteInput): JsonLd {
  return node("WebSite", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    publisher: input.publisher,
    potentialAction: input.potentialAction,
  });
}

export function organizationNode(input: OrganizationInput): JsonLd {
  return node("Organization", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    logo: imageValue(input.logo ?? input.image),
    image: imageValue(input.image),
    sameAs: input.sameAs,
  });
}

export function softwareApplicationNode(input: SoftwareApplicationInput): JsonLd {
  return node("SoftwareApplication", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    applicationCategory: input.applicationCategory,
    operatingSystem: input.operatingSystem,
    offers: input.offers,
    softwareVersion: input.softwareVersion,
  });
}

export function webApplicationNode(input: SoftwareApplicationInput): JsonLd {
  return {
    ...softwareApplicationNode(input),
    "@type": "WebApplication",
  };
}

export function articleNode(input: ArticleInput): JsonLd {
  return node("Article", {
    "@id": input.id,
    headline: requireText(input.headline ?? input.name, "headline"),
    name: input.name,
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    author: personOrOrganizationRef(input.author),
    publisher: personOrOrganizationRef(input.publisher),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: input.mainEntityOfPage ?? input.url,
  });
}

export function techArticleNode(input: ArticleInput): JsonLd {
  return {
    ...articleNode(input),
    "@type": "TechArticle",
  };
}

export function blogPostingNode(input: ArticleInput): JsonLd {
  return {
    ...articleNode(input),
    "@type": "BlogPosting",
  };
}

export function breadcrumbListSchema(input: BreadcrumbListInput): JsonLd {
  if (!input.items.length) throw new Error("BreadcrumbList requires at least one item");
  return node("BreadcrumbList", {
    "@id": input.id,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: requireText(item.label, "breadcrumb label"),
      item: requireText(item.href, "breadcrumb href"),
    })),
  });
}

export function faqPageSchema(input: FaqPageInput): JsonLd {
  if (!input.items.length) throw new Error("FAQPage requires at least one question");
  return node("FAQPage", {
    "@id": input.id,
    mainEntity: input.items.map((item) => ({
      "@type": "Question",
      name: requireText(item.question, "FAQ question"),
      acceptedAnswer: {
        "@type": "Answer",
        text: requireText(item.answer, "FAQ answer"),
      },
    })),
  });
}

export function qaPageSchema(input: QaPageInput): JsonLd {
  return node("QAPage", {
    "@id": input.id,
    url: input.url,
    mainEntity: {
      "@type": "Question",
      name: requireText(input.question, "QAPage question"),
      acceptedAnswer: {
        "@type": "Answer",
        text: requireText(input.answer, "QAPage answer"),
      },
    },
  });
}

export function educationQaPageSchema(input: QaPageInput): JsonLd {
  return qaPageSchema(input);
}

export function howToNode(input: HowToInput): JsonLd {
  if (!input.steps.length) throw new Error("HowTo requires at least one step");
  return node("HowTo", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    totalTime: input.totalTime,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: requireText(step.name, "HowTo step name"),
      text: requireText(step.text, "HowTo step text"),
      url: step.url,
      image: imageValue(step.image),
    })),
  });
}

export function itemListNode(input: ItemListInput): JsonLd {
  if (!input.items.length) throw new Error("ItemList requires at least one item");
  return node("ItemList", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: requireText(item.name, "ItemList item name"),
      url: item.url,
      item: item.item,
    })),
  });
}

export function carouselSchema(input: ItemListInput): JsonLd {
  return itemListNode(input);
}

export function courseListSchema(input: ItemListInput): JsonLd {
  return itemListNode(input);
}

export function softwareSourceCodeNode(input: SoftwareSourceCodeInput): JsonLd {
  return node("SoftwareSourceCode", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    codeRepository: input.codeRepository,
    programmingLanguage: input.programmingLanguage,
    runtimePlatform: input.runtimePlatform,
  });
}

export function productNode(input: ProductInput): JsonLd {
  return node("Product", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    brand: input.brand,
    sku: input.sku,
    category: input.category,
    offers: input.offers,
    aggregateRating: input.aggregateRating,
    review: input.review,
  });
}

export function merchantListingNode(input: ProductInput): JsonLd {
  return productNode(input);
}

export function productSnippetNode(input: ProductInput): JsonLd {
  return productNode(input);
}

export function datasetNode(input: DatasetInput): JsonLd {
  return node("Dataset", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    creator: personOrOrganizationRef(input.creator),
    distribution: input.distribution,
    keywords: input.keywords,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
  });
}

export function eventNode(input: EventInput): JsonLd {
  return node("Event", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    startDate: requireText(input.startDate, "startDate"),
    endDate: input.endDate,
    eventStatus: input.eventStatus,
    eventAttendanceMode: input.eventAttendanceMode,
    location: input.location,
    organizer: personOrOrganizationRef(input.organizer),
  });
}

export function videoObjectNode(input: VideoObjectInput): JsonLd {
  return node("VideoObject", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate: requireText(input.uploadDate, "uploadDate"),
    duration: input.duration,
    embedUrl: input.embedUrl,
    contentUrl: input.contentUrl,
  });
}

export function imageObjectSchema(input: ImageObjectInput): JsonLd {
  const contentUrl = input.contentUrl ?? input.url;
  return node("ImageObject", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url ?? contentUrl,
    contentUrl,
    width: input.width,
    height: input.height,
    caption: input.caption,
  });
}

export function profilePageNode(input: ProfilePageInput): JsonLd {
  return node("ProfilePage", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    mainEntity: input.mainEntity,
  });
}

export function aggregateRatingNode(input: AggregateRatingInput): JsonLd {
  return node("AggregateRating", {
    ratingValue: input.ratingValue,
    reviewCount: input.reviewCount,
    ratingCount: input.ratingCount,
    bestRating: input.bestRating,
    worstRating: input.worstRating,
  });
}

export function reviewNode(input: ReviewInput): JsonLd {
  return node("Review", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    itemReviewed: input.itemReviewed,
    reviewRating: input.reviewRating,
    author: personOrOrganizationRef(input.author),
    reviewBody: input.reviewBody,
  });
}

export function courseNode(input: CourseInput): JsonLd {
  return node("Course", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    provider: personOrOrganizationRef(input.provider),
    courseCode: input.courseCode,
    coursePrerequisites: input.coursePrerequisites,
    hasCourseInstance: input.hasCourseInstance,
  });
}

export function courseInstanceNode(input: CourseInstanceInput): JsonLd {
  return node("CourseInstance", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    courseMode: input.courseMode,
    startDate: input.startDate,
    endDate: input.endDate,
    location: input.location,
    instructor: personOrOrganizationRef(input.instructor),
  });
}

export function discussionForumPostingNode(input: DiscussionForumPostingInput): JsonLd {
  return node("DiscussionForumPosting", {
    "@id": input.id,
    headline: input.headline ?? input.name,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    author: personOrOrganizationRef(input.author),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    articleBody: input.articleBody,
  });
}

export function bookNode(input: BookInput): JsonLd {
  return node("Book", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    author: personOrOrganizationRef(input.author),
    isbn: input.isbn,
    potentialAction: input.readAction,
  });
}

export function readActionNode(target: string | JsonLd): JsonLd {
  return node("ReadAction", { target });
}

export function claimReviewNode(input: ClaimReviewInput): JsonLd {
  return node("ClaimReview", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    claimReviewed: requireText(input.claimReviewed, "claimReviewed"),
    itemReviewed: input.itemReviewed,
    author: personOrOrganizationRef(input.author),
    reviewRating: input.reviewRating,
    datePublished: input.datePublished,
  });
}

export function employerAggregateRatingNode(input: AggregateRatingInput): JsonLd {
  return {
    ...aggregateRatingNode(input),
    "@type": "EmployerAggregateRating",
  };
}

export function estimatedSalaryNode(input: { name?: string; currency?: string; minValue?: number; maxValue?: number; unitText?: string }): JsonLd {
  return node("MonetaryAmountDistribution", {
    name: input.name,
    currency: input.currency,
    duration: input.unitText,
    percentile10: input.minValue,
    percentile90: input.maxValue,
  });
}

export function jobPostingNode(input: JobPostingInput): JsonLd {
  return node("JobPosting", {
    "@id": input.id,
    title: requireText(input.title, "title"),
    name: input.name || input.title,
    description: input.description,
    url: input.url,
    datePosted: requireText(input.datePosted, "datePosted"),
    validThrough: input.validThrough,
    employmentType: input.employmentType,
    hiringOrganization: personOrOrganizationRef(input.hiringOrganization),
    jobLocation: input.jobLocation,
    baseSalary: input.baseSalary,
  });
}

export function localBusinessNode(input: LocalBusinessInput): JsonLd {
  return node("LocalBusiness", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    logo: imageValue(input.logo),
    sameAs: input.sameAs,
    address: input.address,
    telephone: input.telephone,
    priceRange: input.priceRange,
    openingHours: input.openingHours,
  });
}

export function loyaltyProgramNode(input: LoyaltyProgramInput): JsonLd {
  return node("MemberProgram", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    provider: personOrOrganizationRef(input.provider),
  });
}

export function mathSolverNode(input: MathSolverInput): JsonLd {
  return node("MathSolver", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    mathExpression: input.mathExpression,
  });
}

export function merchantReturnPolicyNode(input: PolicyInput): JsonLd {
  return node("MerchantReturnPolicy", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    merchantReturnDays: input.merchantReturnDays,
    returnPolicyCategory: input.returnPolicyCategory,
  });
}

export function offerShippingDetailsNode(input: PolicyInput): JsonLd {
  return node("OfferShippingDetails", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    shippingDestination: input.shippingDestination,
    shippingRate: input.shippingRate,
  });
}

export function movieNode(input: MovieInput): JsonLd {
  return node("Movie", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    director: personOrOrganizationRef(input.director),
    actor: Array.isArray(input.actor) ? input.actor.map(personOrOrganizationRef) : personOrOrganizationRef(input.actor),
    datePublished: input.datePublished,
  });
}

export function productGroupNode(input: ProductGroupInput): JsonLd {
  return {
    ...productNode(input),
    "@type": "ProductGroup",
    hasVariant: input.hasVariant,
    variesBy: input.variesBy,
  };
}

export function recipeNode(input: RecipeInput): JsonLd {
  return node("Recipe", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    author: personOrOrganizationRef(input.author),
    datePublished: input.datePublished,
    recipeIngredient: input.recipeIngredient,
    recipeInstructions: Array.isArray(input.recipeInstructions)
      ? input.recipeInstructions.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: requireText(step.name, "Recipe step name"),
          text: requireText(step.text, "Recipe step text"),
        }))
      : input.recipeInstructions,
    prepTime: input.prepTime,
    cookTime: input.cookTime,
    totalTime: input.totalTime,
  });
}

export function speakableSpecificationNode(input: SpeakableInput): JsonLd {
  return node("SpeakableSpecification", {
    cssSelector: input.cssSelector,
    xpath: input.xpath,
  });
}

export function paywalledContentSchema(input: PaywalledContentInput): JsonLd {
  return {
    ...webPageSchema(input),
    isAccessibleForFree: false,
    hasPart: input.cssSelector?.map((selector) => ({
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: selector,
    })),
  };
}

export function vacationRentalNode(input: VacationRentalInput): JsonLd {
  return node("VacationRental", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    address: input.address,
    containsPlace: input.containsPlace,
  });
}

export function vehicleListingNode(input: VehicleInput): JsonLd {
  return node("Vehicle", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image),
    brand: input.brand,
    offers: input.offers,
    vehicleIdentificationNumber: input.vehicleIdentificationNumber,
    vehicleModelDate: input.vehicleModelDate,
    mileageFromOdometer: input.mileageFromOdometer,
  });
}

export function jsonLdGraph(nodes: JsonLd[], id?: string): JsonLd {
  if (!nodes.length) throw new Error("JSON-LD graph requires at least one node");
  return compact({
    "@context": SCHEMA_CONTEXT,
    "@id": id,
    "@graph": nodes,
  }) as JsonLd;
}

export function organizationSchema(site: StructuredDataSite): JsonLd {
  return organizationNode({
    id: stableId(site.product.canonicalUrl, "organization"),
    name: site.product.name,
    description: site.product.description,
    url: site.product.canonicalUrl,
    logo: site.product.logo,
    sameAs: site.product.sameAs,
  });
}

export function websiteSchema(site: StructuredDataSite): JsonLd {
  return webSiteSchema({
    id: stableId(site.product.canonicalUrl, "website"),
    name: site.product.name,
    description: site.product.description,
    url: site.product.canonicalUrl,
  });
}

export function softwareApplicationSchema(site: StructuredDataSite): JsonLd {
  return softwareApplicationNode({
    id: stableId(site.product.canonicalUrl, "software-application"),
    name: site.product.name,
    description: site.product.description,
    url: site.product.canonicalUrl,
    image: site.product.logo,
    applicationCategory: site.product.category,
  });
}

export function webApplicationSchema(site: StructuredDataSite): JsonLd {
  return webApplicationNode({
    id: stableId(site.product.canonicalUrl, "web-application"),
    name: site.product.name,
    description: site.product.description,
    url: site.product.canonicalUrl,
    image: site.product.logo,
    applicationCategory: site.product.category,
  });
}

export function softwareSourceCodeSchema(page: StructuredDataPage): JsonLd {
  return softwareSourceCodeNode({
    id: stableId(page.canonicalUrl, "software-source-code"),
    name: page.h1,
    description: page.description,
    url: page.canonicalUrl,
  });
}

export function techArticleSchema(page: StructuredDataPage): JsonLd {
  return techArticleNode({
    id: stableId(page.canonicalUrl, "tech-article"),
    name: page.h1,
    headline: page.title,
    description: page.description,
    url: page.canonicalUrl,
    image: page.image,
    datePublished: page.datePublished,
    dateModified: page.dateModified,
    author: page.authorName,
  });
}

export function articleSchema(page: StructuredDataPage): JsonLd {
  return articleNode({
    id: stableId(page.canonicalUrl, "article"),
    name: page.h1,
    headline: page.title,
    description: page.description,
    url: page.canonicalUrl,
    image: page.image,
    datePublished: page.datePublished,
    dateModified: page.dateModified,
    author: page.authorName,
  });
}

export function breadcrumbSchema(items: StructuredDataBreadcrumbItem[]): JsonLd {
  return breadcrumbListSchema({ items });
}

export function faqSchema(items: StructuredDataFaqItem[]): JsonLd {
  return faqPageSchema({ items });
}

export function itemListSchema(name: string, items: Array<{ name: string; url?: string }>): JsonLd {
  return itemListNode({ name, items });
}

export function howToSchema(page: StructuredDataPage): JsonLd {
  return howToNode({
    id: stableId(page.canonicalUrl, "how-to"),
    name: page.h1,
    description: page.description,
    url: page.canonicalUrl,
    steps: [{ name: page.h1, text: page.description ?? page.title, url: page.canonicalUrl }],
  });
}

const canonicalHref = (baseUrl: string, href: string): string =>
  href.startsWith("http") ? href : `${baseUrl.replace(/\/+$/, "")}${href.startsWith("/") ? href : `/${href}`}`;

export function buildJsonLdGraph(site: StructuredDataSite, page: StructuredDataPage): JsonLd[] {
  const canonicalRoot = site.product.canonicalUrl;
  const organization = organizationSchema(site);
  const website = websiteSchema(site);
  const breadcrumb = breadcrumbListSchema({
    id: stableId(page.canonicalUrl, "breadcrumb"),
    items: page.breadcrumbs.map((item) => ({ ...item, href: canonicalHref(canonicalRoot, item.href) })),
  });
  const graph: JsonLd[] = [
    organization,
    website,
    softwareApplicationSchema(site),
    webPageSchema({
      id: stableId(page.canonicalUrl, "web-page"),
      name: page.h1,
      description: page.description,
      url: page.canonicalUrl,
      image: page.image,
      breadcrumb,
      isPartOf: website,
      datePublished: page.datePublished,
      dateModified: page.dateModified,
    }),
    breadcrumb,
  ];

  if (page.kind === "answer" || page.kind === "feature" || page.kind === "docs_bridge") graph.push(techArticleSchema(page));
  if (page.faq?.length) graph.push(faqSchema(page.faq));
  if (page.kind === "package") graph.push(softwareSourceCodeSchema(page));
  if (page.kind === "blog" || page.kind === "update") {
    graph.push(
      blogPostingNode({
        id: stableId(page.canonicalUrl, "blog-posting"),
        name: page.h1,
        headline: page.title,
        description: page.description,
        url: page.canonicalUrl,
        image: page.image,
        datePublished: page.datePublished,
        dateModified: page.dateModified,
        author: page.authorName ?? organization,
        publisher: organization,
      }),
    );
  }

  return graph;
}
