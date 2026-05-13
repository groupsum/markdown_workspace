import { imageValue, node, personOrOrganizationRef, requireText } from "./core.js";
import {
  articleNode,
  aggregateRatingNode,
  imageObjectSchema,
  productNode,
  qaPageSchema,
  softwareApplicationNode,
  softwareSourceCodeNode,
  webApplicationNode,
  webPageSchema,
  webSiteSchema,
  organizationNode,
  techArticleNode,
  itemListNode,
  faqPageSchema,
  breadcrumbListSchema,
  howToNode,
} from "./builders-primary.js";
import type {
  AggregateRatingInput,
  BookInput,
  ClaimReviewInput,
  CourseInput,
  CourseInstanceInput,
  DiscussionForumPostingInput,
  JobPostingInput,
  JsonLd,
  LocalBusinessInput,
  LoyaltyProgramInput,
  MathSolverInput,
  MovieInput,
  PaywalledContentInput,
  PolicyInput,
  ProductGroupInput,
  RecipeInput,
  SpeakableInput,
  StructuredDataBreadcrumbItem,
  StructuredDataFaqItem,
  StructuredDataPage,
  StructuredDataSite,
  VacationRentalInput,
  VehicleInput,
} from "./types.js";
import { canonicalHref, stableId } from "./core.js";

export function courseNode(input: CourseInput): JsonLd {
  return node("Course", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
  return { ...aggregateRatingNode(input), "@type": "EmployerAggregateRating" };
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
    image: imageValue(input.image, imageObjectSchema),
    logo: imageValue(input.logo, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
    brand: input.brand,
    offers: input.offers,
    vehicleIdentificationNumber: input.vehicleIdentificationNumber,
    vehicleModelDate: input.vehicleModelDate,
    mileageFromOdometer: input.mileageFromOdometer,
  });
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
      articleNode({
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
    graph[graph.length - 1]["@type"] = "BlogPosting";
  }

  return graph;
}
