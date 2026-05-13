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
