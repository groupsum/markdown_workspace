import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testRoot, '..', '..', '..', '..');
const distRoot = path.resolve(testRoot, '..', 'dist');
const distIndex = path.join(distRoot, 'index.js');
const smokeIndex = path.join(distRoot, 'index.smoke.mjs');
const structuredDataDist = path.join(repoRoot, 'packages', 'shared', 'structured-data', 'dist', 'index.js').replace(/\\/g, '/');

fs.writeFileSync(
  smokeIndex,
  fs.readFileSync(distIndex, 'utf8').replace('"@mdwrk/structured-data"', `"file:///${structuredDataDist}"`),
);

const {
  AggregateRatingStructuredData,
  ArticleStructuredData,
  BlogPostingStructuredData,
  BookStructuredData,
  BreadcrumbListStructuredData,
  BreadcrumbList,
  ClaimReviewStructuredData,
  CourseInstanceStructuredData,
  CourseStructuredData,
  DatasetStructuredData,
  DiscussionForumPostingStructuredData,
  EmployerAggregateRatingStructuredData,
  EventStructuredData,
  FAQPageStructuredData,
  FaqPage,
  HowToStructuredData,
  ImageObjectStructuredData,
  ItemListStructuredData,
  JobPostingStructuredData,
  LocalBusinessStructuredData,
  MathSolverStructuredData,
  MemberProgramStructuredData,
  MerchantReturnPolicyStructuredData,
  MonetaryAmountDistributionStructuredData,
  MovieStructuredData,
  OfferShippingDetailsStructuredData,
  OrganizationStructuredData,
  ProductGroupStructuredData,
  ProductStructuredData,
  ProfilePageStructuredData,
  QAPageStructuredData,
  ReadActionStructuredData,
  RecipeStructuredData,
  ReviewStructuredData,
  SoftwareApplicationStructuredData,
  SoftwareSourceCodeStructuredData,
  SpeakableSpecificationStructuredData,
  TechArticleStructuredData,
  VacationRentalStructuredData,
  VehicleStructuredData,
  VideoObjectStructuredData,
  WebApplicationStructuredData,
  WebPageStructuredData,
  WebSiteStructuredData,
  buildLanderJsonLdGraph,
  landerStructuredDataIntentRegistry,
  renderStructuredDataIntent,
} = await import(`file:///${smokeIndex.replace(/\\/g, '/')}`);
fs.rmSync(smokeIndex, { force: true });

const site = {
  product: {
    name: 'MdWrk',
    slug: 'mdwrk',
    tagline: 'Local-first Markdown workspace',
    description: 'MdWrk is a local-first Markdown workspace with reusable lander packages.',
    category: 'ProductivityApplication',
    canonicalUrl: 'https://mdwrk.test',
    logo: { src: 'https://mdwrk.test/favicon.svg', alt: 'MdWrk logo' },
    sameAs: ['https://github.com/groupsum/markdown_workspace'],
  },
  pages: [],
  pageByPath: new Map(),
  diagnostics: [],
  seo: {
    defaultImage: { src: 'https://mdwrk.test/og.png', alt: 'MdWrk preview image', width: 1200, height: 630 },
  },
};

const page = {
  kind: 'package',
  slug: '/packages/structured-data/',
  path: '/packages/structured-data/',
  title: 'Structured Data Package | MdWrk',
  description: 'The structured data package emits JSON-LD nodes for lander pages.',
  h1: 'Structured Data Package',
  intro: 'Use this page to validate every lander structured data rich-result family.',
  canonicalUrl: 'https://mdwrk.test/packages/structured-data/',
  breadcrumbs: [
    { label: 'MdWrk', href: '/' },
    { label: 'Packages', href: '/packages/' },
    { label: 'Structured Data Package', href: '/packages/structured-data/' },
  ],
  internalLinks: [],
  wordCount: 120,
  sections: [
    {
      id: 'install',
      kind: 'markdown',
      title: 'Install',
      body: 'Install and use the structured data package.',
    },
  ],
  faq: [{ question: 'Does the lander emit JSON-LD?', answer: 'Yes, visible FAQ content is mirrored into FAQPage JSON-LD.' }],
  seo: {
    keywords: ['structured-data', 'json-ld'],
    image: { src: 'https://mdwrk.test/package.png', alt: 'Structured data package screenshot' },
  },
  schema: [
    { kind: 'WebPage' },
    { kind: 'Organization' },
    { kind: 'WebSite' },
    { kind: 'SoftwareApplication' },
    { kind: 'WebApplication' },
    { kind: 'SoftwareSourceCode', data: { codeRepository: 'https://github.com/groupsum/markdown_workspace' } },
    { kind: 'TechArticle' },
    { kind: 'Article' },
    { kind: 'BlogPosting', data: { datePublished: '2026-05-06' } },
    { kind: 'FAQPage' },
    { kind: 'BreadcrumbList' },
    { kind: 'Dataset', data: { keywords: ['structured-data', 'json-ld'] } },
    { kind: 'ImageObject' },
    { kind: 'ItemList' },
    { kind: 'HowTo' },
    { kind: 'Product' },
    { kind: 'ProfilePage' },
    {
      kind: 'VideoObject',
      data: {
        thumbnailUrl: 'https://mdwrk.test/video.png',
        uploadDate: '2026-05-06',
        embedUrl: 'https://mdwrk.test/video',
      },
    },
  ],
};

const graph = buildLanderJsonLdGraph(site, page);
const types = graph['@graph'].map((node) => node['@type']);

for (const type of [
  'WebPage',
  'Organization',
  'WebSite',
  'SoftwareApplication',
  'WebApplication',
  'SoftwareSourceCode',
  'TechArticle',
  'Article',
  'BlogPosting',
  'FAQPage',
  'BreadcrumbList',
  'Dataset',
  'ImageObject',
  'ItemList',
  'HowTo',
  'Product',
  'ProfilePage',
  'VideoObject',
]) {
  assert.ok(types.includes(type), `missing ${type}`);
}

assert.equal(graph['@context'], 'https://schema.org');
assert.ok(graph['@id'].endsWith('#jsonld'));
assert.equal(graph['@graph'].find((node) => node['@type'] === 'FAQPage').mainEntity.length, 1);
assert.equal(graph['@graph'].find((node) => node['@type'] === 'BreadcrumbList').itemListElement.length, 3);

const typedCases = [
  ['WebPage', WebPageStructuredData, { data: { name: 'Page', url: 'https://mdwrk.test/page', description: 'page' } }],
  ['WebSite', WebSiteStructuredData, { data: { name: 'Site', url: 'https://mdwrk.test', description: 'site' } }],
  ['Organization', OrganizationStructuredData, { data: { name: 'MdWrk', url: 'https://mdwrk.test' } }],
  ['SoftwareApplication', SoftwareApplicationStructuredData, { data: { name: 'MdWrk App', url: 'https://mdwrk.test/app' } }],
  ['WebApplication', WebApplicationStructuredData, { data: { name: 'MdWrk Web App', url: 'https://mdwrk.test/web-app' } }],
  ['Article', ArticleStructuredData, { data: { name: 'Article', url: 'https://mdwrk.test/article' } }],
  ['TechArticle', TechArticleStructuredData, { data: { name: 'Tech Article', url: 'https://mdwrk.test/tech-article' } }],
  ['BlogPosting', BlogPostingStructuredData, { data: { name: 'Blog Posting', url: 'https://mdwrk.test/blog-posting' } }],
  ['BreadcrumbList', BreadcrumbListStructuredData, { data: { items: [{ label: 'Home', href: 'https://mdwrk.test/' }] } }],
  ['FAQPage', FAQPageStructuredData, { data: { items: [{ question: 'Q?', answer: 'A.' }] } }],
  ['QAPage', QAPageStructuredData, { data: { question: 'Q?', answer: 'A.', url: 'https://mdwrk.test/qa' } }],
  ['HowTo', HowToStructuredData, { data: { name: 'How To', url: 'https://mdwrk.test/how-to', steps: [{ name: 'Step 1', text: 'Do it.' }] } }],
  ['ItemList', ItemListStructuredData, { data: { name: 'Items', items: [{ name: 'Item 1', url: 'https://mdwrk.test/item-1' }] } }],
  ['SoftwareSourceCode', SoftwareSourceCodeStructuredData, { data: { name: 'Source', url: 'https://mdwrk.test/source' } }],
  ['Product', ProductStructuredData, { data: { name: 'Product', url: 'https://mdwrk.test/product' } }],
  ['Dataset', DatasetStructuredData, { data: { name: 'Dataset', url: 'https://mdwrk.test/dataset' } }],
  ['Event', EventStructuredData, { data: { name: 'Launch', url: 'https://mdwrk.test/event', startDate: '2026-05-13' } }],
  ['VideoObject', VideoObjectStructuredData, { data: { name: 'Video', url: 'https://mdwrk.test/video', thumbnailUrl: 'https://mdwrk.test/video.png', uploadDate: '2026-05-13' } }],
  ['ImageObject', ImageObjectStructuredData, { data: { name: 'Image', url: 'https://mdwrk.test/image.png' } }],
  ['ProfilePage', ProfilePageStructuredData, { data: { name: 'Profile', url: 'https://mdwrk.test/profile', mainEntity: 'https://mdwrk.test/#org' } }],
  ['Review', ReviewStructuredData, { data: { name: 'Review', url: 'https://mdwrk.test/review', itemReviewed: 'https://mdwrk.test/product', reviewBody: 'Solid.' } }],
  ['AggregateRating', AggregateRatingStructuredData, { data: { ratingValue: 5, reviewCount: 1 } }],
  ['Course', CourseStructuredData, { data: { name: 'Course', url: 'https://mdwrk.test/course' } }],
  ['CourseInstance', CourseInstanceStructuredData, { data: { name: 'Course Instance', url: 'https://mdwrk.test/course-instance' } }],
  ['DiscussionForumPosting', DiscussionForumPostingStructuredData, { data: { name: 'Forum Post', url: 'https://mdwrk.test/forum-post' } }],
  ['Book', BookStructuredData, { data: { name: 'Book', url: 'https://mdwrk.test/book' } }],
  ['ReadAction', ReadActionStructuredData, { target: 'https://mdwrk.test/book' }],
  ['ClaimReview', ClaimReviewStructuredData, { data: { name: 'Claim Review', url: 'https://mdwrk.test/claim-review', claimReviewed: 'Claim text' } }],
  ['EmployerAggregateRating', EmployerAggregateRatingStructuredData, { data: { ratingValue: 4.9, reviewCount: 10 } }],
  ['MonetaryAmountDistribution', MonetaryAmountDistributionStructuredData, { data: { name: 'Salary', currency: 'USD', minValue: 10, maxValue: 20, unitText: 'HOUR' } }],
  ['JobPosting', JobPostingStructuredData, { data: { name: 'Engineer', title: 'Engineer', url: 'https://mdwrk.test/jobs/engineer', datePosted: '2026-05-13', hiringOrganization: 'https://mdwrk.test/#org' } }],
  ['LocalBusiness', LocalBusinessStructuredData, { data: { name: 'Local Biz', url: 'https://mdwrk.test/local' } }],
  ['MemberProgram', MemberProgramStructuredData, { data: { name: 'Member Program', url: 'https://mdwrk.test/member-program' } }],
  ['MathSolver', MathSolverStructuredData, { data: { name: 'Math Solver', url: 'https://mdwrk.test/math-solver' } }],
  ['MerchantReturnPolicy', MerchantReturnPolicyStructuredData, { data: { name: 'Returns' } }],
  ['OfferShippingDetails', OfferShippingDetailsStructuredData, { data: { name: 'Shipping' } }],
  ['Movie', MovieStructuredData, { data: { name: 'Movie', url: 'https://mdwrk.test/movie' } }],
  ['ProductGroup', ProductGroupStructuredData, { data: { name: 'Product Group', url: 'https://mdwrk.test/product-group' } }],
  ['Recipe', RecipeStructuredData, { data: { name: 'Recipe', url: 'https://mdwrk.test/recipe', recipeIngredient: ['salt'], recipeInstructions: 'Mix.' } }],
  ['SpeakableSpecification', SpeakableSpecificationStructuredData, { data: { cssSelector: ['.answer'] } }],
  ['VacationRental', VacationRentalStructuredData, { data: { name: 'Rental', url: 'https://mdwrk.test/rental' } }],
  ['Vehicle', VehicleStructuredData, { data: { name: 'Vehicle', url: 'https://mdwrk.test/vehicle' } }],
];

for (const [type, Component, props] of typedCases) {
  const markup = renderToStaticMarkup(React.createElement(Component, props));
  assert.ok(markup.includes('"@type":"'), `missing script payload for ${type}`);
  assert.ok(markup.includes(`"${type}"`), `missing ${type} payload`);
}

const faqMarkup = renderToStaticMarkup(React.createElement(FaqPage, { items: page.faq }));
assert.ok(faqMarkup.includes('Frequently Asked Questions'));
assert.ok(faqMarkup.includes('Does the lander emit JSON-LD?'));

const breadcrumbsMarkup = renderToStaticMarkup(React.createElement(BreadcrumbList, { items: page.breadcrumbs }));
assert.ok(breadcrumbsMarkup.includes('MdWrk'));
assert.ok(breadcrumbsMarkup.includes('Structured Data Package'));
assert.ok(breadcrumbsMarkup.includes('class="lander-breadcrumbs"'));
assert.ok(breadcrumbsMarkup.includes('class="lander-breadcrumbs__list"'));
assert.ok(breadcrumbsMarkup.includes('class="lander-breadcrumbs__link"'));
assert.ok(breadcrumbsMarkup.includes('class="lander-breadcrumbs__current"'));
assert.ok(breadcrumbsMarkup.includes('aria-current="page"'));

assert.equal(Object.keys(landerStructuredDataIntentRegistry).length, 42);
assert.equal(landerStructuredDataIntentRegistry.WebPage.componentName, 'WebPageStructuredData');
const intentMarkup = renderToStaticMarkup(renderStructuredDataIntent({
  id: 'intent:webpage',
  kind: 'WebPage',
  pagePath: '/packages/structured-data/',
  source: 'schema',
  data: { name: 'Intent Page', url: 'https://mdwrk.test/intent-page' },
}));
assert.ok(intentMarkup.includes('"WebPage"'));
