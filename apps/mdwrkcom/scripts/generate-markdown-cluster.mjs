#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landerRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(landerRoot, '..', '..');
const matrixPath = path.join(landerRoot, 'data', 'markdown-topic-matrix.json');
const appGeneratedRoot = path.join(landerRoot, 'content', 'pages', 'markdown', 'generated');
const packGeneratedRoot = path.join(repoRoot, 'packages', 'content', 'mdwrkcom-content-pack', 'content', 'pages', 'markdown', 'generated');
const packMatrixPath = path.join(repoRoot, 'packages', 'content', 'mdwrkcom-content-pack', 'data', 'markdown-topic-matrix.json');
const reportPath = path.join(landerRoot, 'generated', 'markdown-cluster-report.json');
const checkOnly = process.argv.includes('--check');

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const templateById = new Map(matrix.templates.map((template) => [template.id, template]));

const sentence = (value) => value.endsWith('.') ? value : `${value}.`;
const titleCase = (value) => value.replace(/\bmdwrk\b/gi, 'MdWrk');
const words = (value) => value.trim().split(/\s+/).length;
const ensureDir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true });
const toIsoDate = () => new Date().toISOString().slice(0, 10);

const yamlValue = (value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
const yamlLine = (key, value) => `${key}: ${yamlValue(value)}`;
const yamlArrayBlock = (key, values) => {
  if (!values.length) return '';
  return `${key}:\n${values.map((value) => `  - ${yamlValue(value)}`).join('\n')}`;
};

const renderFrontmatter = (page) => {
  const lines = [
    '---',
    yamlLine('schema', 'mdwrk.page.v1'),
    yamlLine('slug', page.slug),
    yamlLine('title', page.title),
    yamlLine('description', page.description),
    yamlLine('h1', page.h1),
    yamlLine('entity', 'MdWrk'),
    yamlLine('intent', page.intent),
    yamlLine('contentType', 'docs'),
    yamlLine('updatedAt', page.updatedAt),
    yamlLine('author', 'CobyCloud'),
    yamlLine('subtitle', page.subtitle),
    yamlLine('parent', '/markdown/'),
    yamlArrayBlock('related', page.related),
    'faqs:',
    ...page.faqs.flatMap((faq) => [
      `  - question: ${yamlValue(faq.question)}`,
      `    answer: ${yamlValue(faq.answer)}`,
    ]),
    '---',
  ].filter(Boolean);
  return lines.join('\n');
};

const templateContent = {
  'use-cases': (topic) => ({
    title: `${titleCase(topic.label)} Use Cases | MdWrk`,
    h1: `${titleCase(topic.label)} use cases`,
    intent: `${topic.label} use cases`,
    description: `${titleCase(topic.label)} use cases cover the practical situations where teams choose this Markdown workflow, surface, or document model.`,
    subtitle: `Review common ${topic.label} use cases before choosing tools, workflow boundaries, and reusable package surfaces.`,
    faqs: [
      {
        question: `What are common ${topic.label} use cases?`,
        answer: `${titleCase(topic.label)} use cases usually include documentation, review, publishing, knowledge capture, and workflows that benefit from portable plain-text content.`,
      },
      {
        question: `Why do teams evaluate ${topic.label} by use case?`,
        answer: `Use-case review helps teams decide whether the workflow matches their authoring, preview, storage, review, and publishing needs before committing to a toolchain.`,
      },
    ],
    body: [
      `${titleCase(topic.label)} use cases start with the everyday jobs people need to complete. ${sentence(topic.summary)} ${sentence(topic.whyItMatters)}`,
      `${sentence(topic.workflowLine)} In practice, teams usually evaluate the workflow through authoring speed, preview confidence, storage boundaries, collaboration expectations, and the amount of reusable package behavior they need around the content.`,
      `Common ${topic.label} use cases include drafting, reference writing, project documentation, publishing preparation, and Markdown-based review workflows. The right choice depends on whether the team needs a single-document tool, a local-first workspace, a reusable package surface, or a combination of those layers.`,
      `MdWrk is relevant here because it treats Markdown as the durable source artifact while exposing answers, features, compare routes, proof pages, and reusable package pages around the same workflow family.`,
    ].join('\n\n'),
  }),
  'best-practices': (topic) => ({
    title: `${titleCase(topic.label)} Best Practices | MdWrk`,
    h1: `${titleCase(topic.label)} best practices`,
    intent: `${topic.label} best practices`,
    description: `${titleCase(topic.label)} best practices help teams keep Markdown workflows portable, readable, reviewable, and easier to publish.`,
    subtitle: `Use these best practices to keep ${topic.label} workflows clear, durable, and easier to scale.`,
    faqs: [
      {
        question: `What are the best practices for ${topic.label}?`,
        answer: `Strong ${topic.label} practice usually means readable source text, predictable preview behavior, clear storage boundaries, and documented publishing or review steps.`,
      },
      {
        question: `Why do best practices matter for ${topic.label}?`,
        answer: `Best practices reduce drift between what authors write, what reviewers inspect, and what readers or publishing systems finally consume.`,
      },
    ],
    body: [
      `${titleCase(topic.label)} best practices begin with clear source discipline. Writers should keep the Markdown readable in raw form, use stable heading structure, and avoid workflow assumptions that only make sense inside one private application shell.`,
      `${sentence(topic.whyItMatters)} Teams usually get better results when preview behavior, file ownership, storage expectations, and publishing boundaries are explicit instead of implied.`,
      `A good ${topic.label} workflow also separates durable content from presentation-specific behavior. That makes it easier to review the source, move it between tools, and keep documentation or package adoption paths aligned with the same content.`,
      `Within MdWrk, those best-practice ideas map cleanly to local-first authoring, reusable renderer and editor packages, documented theme and extension surfaces, and proof-oriented public documentation.`,
    ].join('\n\n'),
  }),
  'examples': (topic) => ({
    title: `${titleCase(topic.label)} Examples | MdWrk`,
    h1: `${titleCase(topic.label)} examples`,
    intent: `${topic.label} examples`,
    description: `${titleCase(topic.label)} examples show how this Markdown workflow appears in practical authoring, preview, review, and publishing situations.`,
    subtitle: `Use these examples to understand how ${topic.label} looks in real Markdown work rather than in abstract product language.`,
    faqs: [
      {
        question: `What do ${topic.label} examples show?`,
        answer: `Examples show how a Markdown workflow behaves in drafting, preview, documentation, review, and publishing situations.`,
      },
      {
        question: `Why do examples matter for ${topic.label}?`,
        answer: `Examples make it easier to evaluate whether the workflow fits real daily writing rather than only sounding good in a feature list.`,
      },
    ],
    body: [
      `${titleCase(topic.label)} examples are most useful when they connect a workflow idea to a concrete authoring job. ${sentence(topic.summary)}`,
      `One common example is a writer moving from a draft to rendered preview while keeping the source in plain text. Another is a documentation team reviewing Markdown in Git, then publishing it through a static site or packaged app surface. A third example is a product team reusing package-level Markdown behavior instead of rebuilding every rendering or editor rule from scratch.`,
      `${sentence(topic.workflowLine)} These examples matter because they show where the workflow supports review, storage, portability, and publishing confidence instead of only describing those properties in the abstract.`,
      `MdWrk connects to this example set by combining local-first workspace behavior with reusable packages, answer pages, proof pages, and comparison routes that explain how the Markdown workflow behaves in practice.`,
    ].join('\n\n'),
  }),
  'benefits': (topic) => ({
    title: `Benefits Of ${titleCase(topic.label)} | MdWrk`,
    h1: `Benefits of ${titleCase(topic.label).toLowerCase()}`,
    intent: `benefits of ${topic.label}`,
    description: `The benefits of ${topic.label} usually include source readability, workflow clarity, portability, and better alignment between writing and publishing.`,
    subtitle: `Review the main benefits of ${topic.label} before deciding whether the workflow fits your Markdown process.`,
    faqs: [
      {
        question: `What are the benefits of ${topic.label}?`,
        answer: `The benefits usually include readable source text, clearer review paths, more portable content, and easier separation between writing and publishing concerns.`,
      },
      {
        question: `Do the benefits of ${topic.label} apply to every team?`,
        answer: `Not equally. The benefits matter most when a team values plain-text portability, explicit workflow boundaries, and predictable Markdown behavior.`,
      },
    ],
    body: [
      `The benefits of ${topic.label} are easiest to understand when you compare them with heavier or less portable writing workflows. ${sentence(topic.summary)}`,
      `${sentence(topic.whyItMatters)} In most cases, the benefit is not only speed. It is also the ability to keep source text readable, inspect rendered output more confidently, and move the same Markdown through multiple tools without losing the content itself.`,
      `Another benefit is workflow clarity. Teams can decide when storage stays local, when sync begins, when repository review matters, and when a package or publishing layer should take over.`,
      `MdWrk builds on those benefits by combining Markdown portability with answer-oriented docs, proof pages, comparison pages, and reusable package surfaces for editor, renderer, theme, and extension behavior.`,
    ].join('\n\n'),
  }),
  'workflow': (topic) => ({
    title: `${titleCase(topic.label)} Workflow | MdWrk`,
    h1: `${titleCase(topic.label)} workflow`,
    intent: `${topic.label} workflow`,
    description: `${titleCase(topic.label)} workflow guidance explains how authors move from Markdown drafting to preview, review, packaging, and publishing.`,
    subtitle: `Use this workflow view to understand how ${topic.label} moves through real writing, review, and output stages.`,
    faqs: [
      {
        question: `What does a ${topic.label} workflow include?`,
        answer: `A typical workflow includes drafting, preview, revision, review, storage or sync decisions, and the final publishing or handoff step.`,
      },
      {
        question: `Why should teams define a ${topic.label} workflow?`,
        answer: `A defined workflow reduces ambiguity about who owns the source, how preview is validated, and when content moves across systems.`,
      },
    ],
    body: [
      `A ${topic.label} workflow usually starts with plain-text authoring and then moves into preview, review, and output-specific steps. ${sentence(topic.summary)}`,
      `${sentence(topic.workflowLine)} What matters most is that the team can explain where the Markdown source lives, how rendered output is checked, who reviews it, and when the content moves into another system such as a site build, repository, or package surface.`,
      `Good workflow design keeps those boundaries explicit. That helps teams avoid mixing local drafting, hosted collaboration, and final publishing into one opaque step.`,
      `MdWrk supports this kind of workflow framing by keeping Markdown central while exposing feature routes, package routes, compare pages, and proof pages that document the surrounding behavior.`,
    ].join('\n\n'),
  }),
  'checklist': (topic) => ({
    title: `${titleCase(topic.label)} Checklist | MdWrk`,
    h1: `${titleCase(topic.label)} checklist`,
    intent: `${topic.label} checklist`,
    description: `A ${topic.label} checklist helps teams review authoring, preview, storage, portability, and publishing concerns before choosing or expanding a Markdown workflow.`,
    subtitle: `Use this checklist to evaluate ${topic.label} before treating it as a durable team workflow.`,
    faqs: [
      {
        question: `What should a ${topic.label} checklist cover?`,
        answer: `A checklist should cover source readability, preview quality, storage boundaries, collaboration expectations, and how the content will be published or reused.`,
      },
      {
        question: `Why use a checklist for ${topic.label}?`,
        answer: `A checklist makes evaluation repeatable and helps teams compare tools or workflow options using the same decision criteria.`,
      },
    ],
    body: [
      `A ${topic.label} checklist should test more than whether the feature or workflow exists. It should also test whether the Markdown source remains understandable, whether preview behaves predictably, and whether the storage model matches the team’s expectations.`,
      `${sentence(topic.whyItMatters)} Teams should also check how the workflow interacts with version control, publishing, package reuse, and any extension or theme surfaces that might affect the final experience.`,
      `Another useful checklist category is portability. If the workflow depends too heavily on private app state, hidden formatting rules, or one delivery target, the long-term benefits of Markdown become weaker.`,
      `MdWrk is useful in this evaluation because it exposes local-first behavior, package surfaces, and proof-oriented public documentation that make these checklist questions easier to answer honestly.`,
    ].join('\n\n'),
  }),
  'for-teams': (topic) => ({
    title: `${titleCase(topic.label)} For Teams | MdWrk`,
    h1: `${titleCase(topic.label)} for teams`,
    intent: `${topic.label} for teams`,
    description: `${titleCase(topic.label)} for teams focuses on shared Markdown workflows, review paths, ownership boundaries, and publishing expectations.`,
    subtitle: `Review how ${topic.label} fits teams that need shared standards, reviewability, and durable plain-text content.`,
    faqs: [
      {
        question: `How does ${topic.label} help teams?`,
        answer: `It helps teams when they need readable source text, explicit workflow boundaries, and content that can move through review and publishing systems without becoming opaque.`,
      },
      {
        question: `What should teams evaluate in ${topic.label}?`,
        answer: `Teams should evaluate ownership, preview fidelity, storage boundaries, publishing expectations, and whether the workflow keeps Markdown portable.`,
      },
    ],
    body: [
      `${titleCase(topic.label)} for teams is mostly about governance and repeatability. A team needs more than a working editor. It needs clear ownership, predictable preview behavior, and a shared understanding of where Markdown lives before and after publishing.`,
      `${sentence(topic.workflowLine)} Teams also need to know when the workflow stays local, when repository or sync systems enter the picture, and whether reusable packages or extensions will shape the output.`,
      `A strong team workflow keeps the Markdown source durable and reviewable. That makes onboarding easier, reduces publishing surprises, and helps different contributors work with the same content model.`,
      `MdWrk aligns with that team-oriented view by connecting local-first behavior, reusable package surfaces, public documentation, and proof pages into one explainable Markdown system.`,
    ].join('\n\n'),
  }),
  'for-developers': (topic) => ({
    title: `${titleCase(topic.label)} For Developers | MdWrk`,
    h1: `${titleCase(topic.label)} for developers`,
    intent: `${topic.label} for developers`,
    description: `${titleCase(topic.label)} for developers focuses on Markdown workflows that intersect with repositories, package reuse, and code-adjacent documentation.`,
    subtitle: `Use this page to evaluate ${topic.label} from a developer workflow perspective rather than only from a general writing perspective.`,
    faqs: [
      {
        question: `Why does ${topic.label} matter for developers?`,
        answer: `It matters when developers need Markdown that stays readable in Git, works with review flows, and can be rendered or reused through packages and publishing systems.`,
      },
      {
        question: `What should developers look for in ${topic.label}?`,
        answer: `Developers usually look for plain-text durability, predictable rendering, repository-friendly review paths, and reusable tooling around the Markdown source.`,
      },
    ],
    body: [
      `${titleCase(topic.label)} for developers is different from general writing guidance because the workflow usually sits close to code, repositories, build output, or package-level reuse.`,
      `${sentence(topic.whyItMatters)} Developers usually care about reviewability, predictable rendering, version control, and whether the Markdown behavior can be shared across applications instead of living inside one private editor.`,
      `${sentence(topic.workflowLine)} That is why package surfaces, renderer contracts, and explicit publishing boundaries matter so much in Markdown-heavy developer environments.`,
      `MdWrk connects well to this perspective because it treats Markdown as durable source while exposing renderer, editor, theme, extension, lander, and content-pack surfaces separately.`,
    ].join('\n\n'),
  }),
};

const buildPage = (topic, template) => {
  const content = templateContent[template.id](topic);
  const slug = `/markdown/${topic.slug}/${template.slug}/`;
  const relativePath = path.join(topic.slug, `${template.slug}.md`);
  const updatedAt = toIsoDate();
  const related = Array.from(new Set(['/markdown/', ...topic.related])).slice(0, 3);
  return {
    ...content,
    slug,
    updatedAt,
    related,
    relativePath,
  };
};

const renderPage = (page) => `${renderFrontmatter(page)}\n\n${page.body.trim()}\n`;

const buildExpectedFiles = () => {
  const files = [];
  for (const topic of matrix.topics) {
    for (const templateId of topic.templates) {
      const template = templateById.get(templateId);
      if (!template) throw new Error(`Unknown template id: ${templateId}`);
      const page = buildPage(topic, template);
      files.push({
        relativePath: page.relativePath,
        content: renderPage(page),
        slug: page.slug,
        topic: topic.id,
        template: template.id,
      });
    }
  }
  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
};

const expectedFiles = buildExpectedFiles();

if (expectedFiles.length < matrix.targetCount.min || expectedFiles.length > matrix.targetCount.max) {
  throw new Error(`Generated page count ${expectedFiles.length} is outside target range ${matrix.targetCount.min}-${matrix.targetCount.max}.`);
}

const expectedByPath = new Map(expectedFiles.map((file) => [file.relativePath.replace(/\\/g, '/'), file.content]));

const listGeneratedMarkdown = (root) => {
  if (!fs.existsSync(root)) return [];
  const results = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        results.push(path.relative(root, fullPath).replace(/\\/g, '/'));
      }
    }
  };
  walk(root);
  return results.sort();
};

const assertNoDrift = (root, label) => {
  const actualFiles = listGeneratedMarkdown(root);
  const expectedPaths = Array.from(expectedByPath.keys()).sort();
  const missing = expectedPaths.filter((file) => !actualFiles.includes(file));
  const extra = actualFiles.filter((file) => !expectedPaths.includes(file));
  const changed = actualFiles.filter((file) => expectedByPath.has(file) && fs.readFileSync(path.join(root, file), 'utf8') !== expectedByPath.get(file));

  if (missing.length || extra.length || changed.length) {
    const lines = [
      `${label} markdown cluster drift detected.`,
      ...missing.map((file) => `Missing: ${file}`),
      ...extra.map((file) => `Extra: ${file}`),
      ...changed.map((file) => `Changed: ${file}`),
    ];
    throw new Error(lines.join('\n'));
  }
};

const assertMirrorFile = (sourcePath, targetPath, label) => {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const target = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, 'utf8') : null;
  if (target !== source) {
    throw new Error(`${label} mirror drift detected for ${path.basename(sourcePath)}.`);
  }
};

const writeTree = (root) => {
  fs.rmSync(root, { recursive: true, force: true });
  for (const file of expectedFiles) {
    const destination = path.join(root, file.relativePath);
    ensureDir(path.dirname(destination));
    fs.writeFileSync(destination, file.content, 'utf8');
  }
};

const writeReport = () => {
  const report = {
    generatedAt: new Date().toISOString(),
    matrixVersion: matrix.version,
    pageCount: expectedFiles.length,
    topicCount: matrix.topics.length,
    templateCount: matrix.templates.length,
    pagesByTopic: Object.fromEntries(matrix.topics.map((topic) => [topic.id, topic.templates.length])),
    pagesByTemplate: Object.fromEntries(matrix.templates.map((template) => [
      template.id,
      expectedFiles.filter((file) => file.template === template.id).length,
    ])),
    sampleSlugs: expectedFiles.slice(0, 12).map((file) => file.slug),
  };
  ensureDir(path.dirname(reportPath));
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
};

if (checkOnly) {
  assertNoDrift(appGeneratedRoot, 'apps/mdwrkcom');
  assertNoDrift(packGeneratedRoot, 'mdwrkcom-content-pack');
  assertMirrorFile(matrixPath, packMatrixPath, 'mdwrkcom-content-pack data');
  console.log(`Markdown cluster check passed: ${expectedFiles.length} generated pages are current.`);
} else {
  writeTree(appGeneratedRoot);
  writeTree(packGeneratedRoot);
  fs.writeFileSync(packMatrixPath, fs.readFileSync(matrixPath, 'utf8'), 'utf8');
  writeReport();
  console.log(`Generated Markdown cluster: ${expectedFiles.length} pages across ${matrix.topics.length} topics and ${matrix.templates.length} templates.`);
}
