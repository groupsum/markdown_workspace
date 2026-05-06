import assert from 'node:assert/strict';
import {
  aggregateRatingNode,
  articleNode,
  blogPostingNode,
  bookNode,
  breadcrumbListSchema,
  buildJsonLdGraph,
  carouselSchema,
  claimReviewNode,
  courseInstanceNode,
  courseListSchema,
  courseNode,
  datasetNode,
  discussionForumPostingNode,
  educationQaPageSchema,
  employerAggregateRatingNode,
  estimatedSalaryNode,
  eventNode,
  faqPageSchema,
  faqSchema,
  howToNode,
  imageObjectSchema,
  itemListNode,
  jsonLdGraph,
  jobPostingNode,
  localBusinessNode,
  loyaltyProgramNode,
  mathSolverNode,
  merchantReturnPolicyNode,
  movieNode,
  organizationNode,
  offerShippingDetailsNode,
  paywalledContentSchema,
  productNode,
  productGroupNode,
  productSnippetNode,
  profilePageNode,
  qaPageSchema,
  readActionNode,
  recipeNode,
  reviewNode,
  softwareApplicationNode,
  softwareSourceCodeNode,
  speakableSpecificationNode,
  stableId,
  techArticleNode,
  vacationRentalNode,
  vehicleListingNode,
  videoObjectNode,
  webApplicationNode,
  webPageSchema,
  webSiteSchema,
  merchantListingNode,
} from '../dist/index.js';

const canonicalUrl = 'https://example.test/docs/structured-data';
const organization = organizationNode({
  id: stableId('https://example.test', 'organization'),
  name: 'Example',
  url: 'https://example.test',
  logo: { src: 'https://example.test/logo.png', alt: 'Example logo' },
});
const website = webSiteSchema({
  id: stableId('https://example.test', 'website'),
  name: 'Example site',
  url: 'https://example.test',
  publisher: organization,
});
const image = imageObjectSchema({
  name: 'Screenshot',
  url: 'https://example.test/screenshot.png',
  width: 1200,
  height: 630,
});
const breadcrumb = breadcrumbListSchema({
  items: [
    { label: 'Home', href: 'https://example.test/' },
    { label: 'Docs', href: 'https://example.test/docs' },
  ],
});
const page = webPageSchema({
  id: stableId(canonicalUrl, 'web-page'),
  name: 'Structured data docs',
  description: 'Documents structured data builders.',
  url: canonicalUrl,
  image,
  breadcrumb,
  isPartOf: website,
});
const softwareApplication = softwareApplicationNode({
  name: 'Example App',
  url: 'https://example.test/app',
  applicationCategory: 'DeveloperApplication',
});
const webApplication = webApplicationNode({
  name: 'Example Web App',
  url: 'https://example.test/app',
  applicationCategory: 'DeveloperApplication',
});
const article = articleNode({
  name: 'Article',
  headline: 'Article headline',
  url: canonicalUrl,
  author: organization,
  publisher: organization,
});
const techArticle = techArticleNode({
  name: 'Tech Article',
  headline: 'Tech Article headline',
  url: canonicalUrl,
  author: organization,
});
const blogPosting = blogPostingNode({
  name: 'Launch note',
  headline: 'Launch note',
  url: 'https://example.test/blog/launch',
  datePublished: '2026-05-06',
  publisher: organization,
});
const faq = faqPageSchema({
  items: [{ question: 'What is this?', answer: 'A structured data test.' }],
});
const qa = qaPageSchema({
  question: 'Can this emit QAPage?',
  answer: 'Yes, when the page is a true Q and A surface.',
});
const educationQa = educationQaPageSchema({
  question: 'What does the lesson prove?',
  answer: 'That education Q and A markup is explicit.',
});
const howTo = howToNode({
  name: 'Install Example',
  description: 'Install the example app.',
  url: 'https://example.test/docs/install',
  steps: [{ name: 'Install', text: 'Run the installer.' }],
});
const itemList = itemListNode({
  name: 'Packages',
  items: [{ name: 'structured-data', url: 'https://example.test/packages/structured-data' }],
});
const carousel = carouselSchema({
  name: 'Featured items',
  items: [{ name: 'Feature one', url: 'https://example.test/features/one' }],
});
const softwareSourceCode = softwareSourceCodeNode({
  name: 'structured-data package',
  url: 'https://example.test/packages/structured-data',
  codeRepository: 'https://github.com/example/repo',
  programmingLanguage: 'TypeScript',
});
const rating = aggregateRatingNode({ ratingValue: 5, reviewCount: 1 });
const review = reviewNode({
  name: 'Visible review',
  itemReviewed: softwareApplication,
  reviewRating: rating,
  author: organization,
  reviewBody: 'This review exists visibly on the page.',
});
const product = productNode({
  name: 'Example Product',
  url: 'https://example.test/product',
  brand: organization,
  aggregateRating: rating,
  review,
});
const merchantListing = merchantListingNode({
  name: 'Example Merchant Listing',
  url: 'https://example.test/merchant-listing',
  brand: organization,
  offers: { '@type': 'Offer', price: '10.00', priceCurrency: 'USD' },
});
const productSnippet = productSnippetNode({
  name: 'Example Product Snippet',
  url: 'https://example.test/product-snippet',
  brand: organization,
});
const dataset = datasetNode({
  name: 'Example dataset',
  description: 'Generated structured data fixture.',
  url: 'https://example.test/dataset.json',
  creator: organization,
  keywords: ['structured-data', 'json-ld'],
});
const event = eventNode({
  name: 'Launch event',
  url: 'https://example.test/events/launch',
  startDate: '2026-05-06T12:00:00Z',
  organizer: organization,
});
const video = videoObjectNode({
  name: 'Demo video',
  url: 'https://example.test/videos/demo',
  thumbnailUrl: 'https://example.test/videos/demo.png',
  uploadDate: '2026-05-06',
});
const profile = profilePageNode({
  name: 'Maintainer profile',
  url: 'https://example.test/team/maintainer',
  mainEntity: organization,
});
const courseInstance = courseInstanceNode({
  name: 'Structured data workshop May 2026',
  courseMode: 'online',
  startDate: '2026-05-06',
});
const course = courseNode({
  name: 'Structured data workshop',
  description: 'Learn JSON-LD builders.',
  url: 'https://example.test/courses/structured-data',
  provider: organization,
  hasCourseInstance: courseInstance,
});
const courseList = courseListSchema({
  name: 'Courses',
  items: [{ name: 'Structured data workshop', item: course }],
});
const discussion = discussionForumPostingNode({
  name: 'Structured data support thread',
  headline: 'Structured data support thread',
  url: 'https://example.test/community/structured-data',
  author: organization,
  articleBody: 'Discussion content is visible on the page.',
});
const readAction = readActionNode('https://example.test/books/read');
const book = bookNode({
  name: 'Structured Data Handbook',
  url: 'https://example.test/books/structured-data',
  author: organization,
  isbn: '9780000000000',
  readAction,
});
const claimReview = claimReviewNode({
  name: 'Structured data fact check',
  url: 'https://example.test/fact-check/structured-data',
  claimReviewed: 'Structured data must match visible page content.',
  author: organization,
  reviewRating: rating,
});
const employerRating = employerAggregateRatingNode({ ratingValue: 4.8, reviewCount: 12 });
const estimatedSalary = estimatedSalaryNode({
  name: 'Structured data engineer salary',
  currency: 'USD',
  minValue: 100000,
  maxValue: 140000,
  unitText: 'YEAR',
});
const jobPosting = jobPostingNode({
  name: 'Structured data engineer',
  title: 'Structured data engineer',
  description: 'Work on JSON-LD builders.',
  url: 'https://example.test/jobs/structured-data',
  datePosted: '2026-05-06',
  hiringOrganization: organization,
  baseSalary: estimatedSalary,
});
const localBusiness = localBusinessNode({
  name: 'Example Office',
  url: 'https://example.test/office',
  address: '100 Example Way',
  telephone: '+1-555-0100',
});
const loyaltyProgram = loyaltyProgramNode({
  name: 'Example Member Program',
  url: 'https://example.test/members',
  provider: organization,
});
const mathSolver = mathSolverNode({
  name: 'Markdown math solver',
  url: 'https://example.test/math',
  mathExpression: 'x + 1 = 2',
});
const returnPolicy = merchantReturnPolicyNode({
  name: 'Return policy',
  url: 'https://example.test/returns',
  merchantReturnDays: 30,
});
const shippingDetails = offerShippingDetailsNode({
  name: 'Shipping policy',
  shippingDestination: 'US',
});
const movie = movieNode({
  name: 'Structured Data Demo',
  url: 'https://example.test/movie',
  director: organization,
});
const productGroup = productGroupNode({
  name: 'Example Product Family',
  url: 'https://example.test/products/family',
  hasVariant: product,
});
const recipe = recipeNode({
  name: 'Structured data recipe',
  url: 'https://example.test/recipes/structured-data',
  recipeIngredient: ['Visible content', 'Typed builder'],
  recipeInstructions: [{ name: 'Render', text: 'Render the visible recipe step.' }],
  author: organization,
});
const speakable = speakableSpecificationNode({
  cssSelector: ['.answer-summary'],
});
const paywalled = paywalledContentSchema({
  name: 'Subscriber guide',
  url: 'https://example.test/subscriber-guide',
  cssSelector: ['.subscriber-only'],
});
const vacationRental = vacationRentalNode({
  name: 'Example Rental',
  url: 'https://example.test/rentals/example',
  address: '100 Example Way',
});
const vehicle = vehicleListingNode({
  name: 'Example Vehicle',
  url: 'https://example.test/vehicles/example',
  brand: organization,
  vehicleIdentificationNumber: 'EXAMPLEVIN123',
});

const nodes = [
  organization,
  website,
  page,
  softwareApplication,
  webApplication,
  article,
  techArticle,
  blogPosting,
  breadcrumb,
  faq,
  qa,
  educationQa,
  howTo,
  itemList,
  carousel,
  softwareSourceCode,
  product,
  merchantListing,
  productSnippet,
  dataset,
  event,
  video,
  image,
  profile,
  review,
  rating,
  course,
  courseInstance,
  courseList,
  discussion,
  book,
  readAction,
  claimReview,
  employerRating,
  estimatedSalary,
  jobPosting,
  localBusiness,
  loyaltyProgram,
  mathSolver,
  returnPolicy,
  shippingDetails,
  movie,
  productGroup,
  recipe,
  speakable,
  paywalled,
  vacationRental,
  vehicle,
];

const expectedTypes = [
  'Organization',
  'WebSite',
  'WebPage',
  'SoftwareApplication',
  'WebApplication',
  'Article',
  'TechArticle',
  'BlogPosting',
  'BreadcrumbList',
  'FAQPage',
  'QAPage',
  'QAPage',
  'HowTo',
  'ItemList',
  'ItemList',
  'SoftwareSourceCode',
  'Product',
  'Product',
  'Product',
  'Dataset',
  'Event',
  'VideoObject',
  'ImageObject',
  'ProfilePage',
  'Review',
  'AggregateRating',
  'Course',
  'CourseInstance',
  'ItemList',
  'DiscussionForumPosting',
  'Book',
  'ReadAction',
  'ClaimReview',
  'EmployerAggregateRating',
  'MonetaryAmountDistribution',
  'JobPosting',
  'LocalBusiness',
  'MemberProgram',
  'MathSolver',
  'MerchantReturnPolicy',
  'OfferShippingDetails',
  'Movie',
  'ProductGroup',
  'Recipe',
  'SpeakableSpecification',
  'WebPage',
  'VacationRental',
  'Vehicle',
];

assert.deepEqual(nodes.map((node) => node['@type']), expectedTypes);
assert.equal(faqSchema([{ question: 'Legacy?', answer: 'Still supported.' }])['@type'], 'FAQPage');
assert.equal(jsonLdGraph(nodes)['@graph'].length, expectedTypes.length);

const graph = buildJsonLdGraph(
  {
    product: {
      name: 'Example',
      slug: 'example',
      tagline: 'Tagline',
      description: 'Description',
      category: 'Software',
      canonicalUrl: 'https://example.test',
      logo: { src: 'https://example.test/logo.png' },
    },
  },
  {
    kind: 'blog',
    slug: '/blog/launch',
    title: 'Example Launch',
    description: 'Long enough description.',
    h1: 'Example Launch',
    canonicalUrl: 'https://example.test/blog/launch',
    breadcrumbs: [{ label: 'Home', href: '/' }],
    faq: [{ question: 'Is this visible?', answer: 'Yes.' }],
    datePublished: '2026-05-06',
  },
);

assert.ok(graph.some((entry) => entry['@type'] === 'WebPage'));
assert.ok(graph.some((entry) => entry['@type'] === 'BlogPosting'));
assert.ok(graph.some((entry) => entry['@type'] === 'FAQPage'));
