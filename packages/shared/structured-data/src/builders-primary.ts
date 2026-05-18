import { imageValue, node, personOrOrganizationRef, requireText } from "./core.js";
import type {
  AggregateRatingInput,
  ArticleInput,
  BreadcrumbListInput,
  DatasetInput,
  EventInput,
  FaqPageInput,
  HowToInput,
  ImageObjectInput,
  ItemListInput,
  JsonLd,
  OrganizationInput,
  ProductInput,
  ProfilePageInput,
  QaPageInput,
  ReviewInput,
  SoftwareApplicationInput,
  SoftwareSourceCodeInput,
  VideoObjectInput,
  WebPageInput,
  WebSiteInput,
} from "./types.js";

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

export function webPageSchema(input: WebPageInput): JsonLd {
  return node("WebPage", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    headline: input.name,
    description: input.description,
    url: input.url,
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
    logo: imageValue(input.logo ?? input.image, imageObjectSchema),
    image: imageValue(input.image, imageObjectSchema),
    sameAs: input.sameAs,
  });
}

export function softwareApplicationNode(input: SoftwareApplicationInput): JsonLd {
  return node("SoftwareApplication", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
    author: personOrOrganizationRef(input.author),
    publisher: personOrOrganizationRef(input.publisher),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: input.mainEntityOfPage ?? input.url,
  });
}

export function techArticleNode(input: ArticleInput): JsonLd {
  return { ...articleNode(input), "@type": "TechArticle" };
}

export function blogPostingNode(input: ArticleInput): JsonLd {
  return { ...articleNode(input), "@type": "BlogPosting" };
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
    image: imageValue(input.image, imageObjectSchema),
    totalTime: input.totalTime,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: requireText(step.name, "HowTo step name"),
      text: requireText(step.text, "HowTo step text"),
      url: step.url,
      image: imageValue(step.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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
  if (input.offers === undefined && input.aggregateRating === undefined && input.review === undefined) {
    throw new Error("Product snippet structured data requires offers, aggregateRating, or review.");
  }
  return productNode(input);
}

export function datasetNode(input: DatasetInput): JsonLd {
  return node("Dataset", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image, imageObjectSchema),
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
    image: imageValue(input.image, imageObjectSchema),
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

export function profilePageNode(input: ProfilePageInput): JsonLd {
  return node("ProfilePage", {
    "@id": input.id,
    name: requireText(input.name, "name"),
    description: input.description,
    url: input.url,
    image: imageValue(input.image, imageObjectSchema),
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
