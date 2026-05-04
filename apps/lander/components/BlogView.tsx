import React, { useMemo } from 'react';
import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { contentFiles } from '../data/content';
import { parseMarkdown } from '../utils/markdownParser';
import { usePageMetadata } from '../hooks/usePageMetadata';
import {
  buildBlogPostingSchema,
  buildBlogSchema,
  buildBreadcrumbSchema,
  buildItemListSchema,
  deriveKeywords,
  extractFirstImage,
  removeFirstImage
} from '../utils/pageMetadata';
import { MarkdownViewer } from './MarkdownViewer';
import { FeaturedImage } from './FeaturedImage';
import { AnswerBlocks, extractTerminalAnswerBlocks } from './AnswerBlocks';
import { Calendar, User, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  authorSlug: string;
  monthSlug: string;
  monthLabel: string;
  displayDate: string;
  excerpt: string;
  metadata: Record<string, any>;
  content: string;
}

const normalizeTitle = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, ' ');

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const removeDuplicateLeadingHeading = (content: string, title?: string) => {
  if (!title) return content;

  const headingMatch = content.match(/^#\s+(.+)\n*/);
  if (!headingMatch) return content;

  const headingText = headingMatch[1]?.trim() ?? '';
  if (normalizeTitle(headingText) !== normalizeTitle(title)) return content;

  return content.slice(headingMatch[0].length).trim();
};

const toPostTime = (date?: string) => {
  if (!date) return 0;
  const time = Date.parse(date);
  return Number.isFinite(time) ? time : 0;
};

const toMonthLabel = (date?: string) => {
  const match = date?.match(/^(\d{4})-(\d{2})/);
  if (!match) return '';
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex)) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, monthIndex, 1));
};

const toDisplayDate = (date?: string) => {
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return date || '';
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return date || '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, monthIndex, day));
};

const getPostSlug = (id: string, metadata: Record<string, any>) => {
  const frontmatterSlug = typeof metadata.slug === 'string' ? metadata.slug.trim() : '';
  if (frontmatterSlug) {
    return frontmatterSlug.replace(/^blog\//, '').replace(/^\/+|\/+$/g, '');
  }
  return id.replace(/^blog\//, '');
};

const getBlogPosts = (): BlogPost[] =>
  Object.keys(contentFiles)
    .filter(path => path.startsWith('blog/'))
    .map(path => {
      const parsed = parseMarkdown(contentFiles[path as keyof typeof contentFiles]);
      const slug = getPostSlug(path, parsed.metadata);
      const author = parsed.metadata.author?.trim() ?? '';
      const date = parsed.metadata.date?.trim() ?? '';
      const excerpt = parsed.metadata.excerpt?.trim() ?? '';
      return {
        id: path,
        slug,
        authorSlug: slugify(author),
        monthSlug: date.slice(0, 7),
        monthLabel: toMonthLabel(date),
        displayDate: toDisplayDate(date),
        excerpt,
        ...parsed,
      };
    })
    .filter((post) => {
      const title = post.metadata.title?.trim();
      const author = post.metadata.author?.trim();
      const date = post.metadata.date?.trim();
      return Boolean(title && post.excerpt && author && date && post.slug && post.authorSlug && post.monthSlug);
    })
    .sort((a, b) => {
      const dateSort = toPostTime(b.metadata.date) - toPostTime(a.metadata.date);
      if (dateSort !== 0) return dateSort;
      return (b.metadata.title || b.id).localeCompare(a.metadata.title || a.id);
    });

const BlogList: React.FC<{
  posts: BlogPost[];
  title: string;
  eyebrow?: string;
}> = ({ posts, title, eyebrow }) => {
  const leadPost = posts[0];
  const featureImage = leadPost ? extractFirstImage(leadPost.content) : null;
  const metadataPath = eyebrow === 'Author Archive'
    ? `/blog/author/${leadPost?.authorSlug || ''}`
    : eyebrow === 'Monthly Archive'
      ? `/blog/archive/${leadPost?.monthSlug || ''}`
      : '/blog';

  usePageMetadata({
    title: eyebrow ? `${title} | MdWrk Blog` : 'MdWrk Blog',
    description: leadPost?.excerpt || `Read the latest ${title} posts from MdWrk.`,
    image: featureImage?.src,
    imageAlt: featureImage?.alt || leadPost?.metadata.title || title,
    keywords: deriveKeywords(title, eyebrow, leadPost?.excerpt, posts.map(post => post.metadata.title).join(' ')),
    path: metadataPath,
    structuredData: [
      buildBlogSchema({
        title: eyebrow ? `${title} | MdWrk Blog` : 'MdWrk Blog',
        description: leadPost?.excerpt || `Read the latest ${title} posts from MdWrk.`,
        path: metadataPath,
      }),
      buildItemListSchema({
        title: eyebrow ? `${title} | MdWrk Blog` : 'MdWrk Blog',
        description: leadPost?.excerpt || `Read the latest ${title} posts from MdWrk.`,
        path: metadataPath,
        items: posts.slice(0, 24).map(post => ({
          title: post.metadata.title,
          path: `/blog/${post.slug}`,
          description: post.excerpt,
        })),
      }),
    ],
  });

  return (
    <div className="lander-blog-shell blog-shell is-list">
      <div className="blog-list-layout">
        {eyebrow ? <div className="blog-list-eyebrow">{eyebrow}</div> : null}
        <h1 className="blog-list-title">
          <span className="blog-list-title-inner">{title}</span>
        </h1>
        <div className="blog-grid">
          {posts.map(post => (
            <article key={post.id} className="lander-content-card blog-card">
              <Link to={`/blog/archive/${post.monthSlug}`} className="blog-card-date">
                <time dateTime={post.metadata.date}>{post.displayDate}</time>
              </Link>
              <h2 className="blog-card-title">
                <Link to={`/blog/${post.slug}`} className="blog-card-title-link">
                  {post.metadata.title}
                </Link>
              </h2>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <Link to={`/blog/author/${post.authorSlug}`} className="blog-card-author">
                <User className="blog-card-author-icon" /> {post.metadata.author}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

const BlogPostPage: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
  const { postSlug } = useParams();
  const post = posts.find(entry => entry.slug === postSlug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const renderedContent = removeDuplicateLeadingHeading(post.content || '', post.metadata.title);
  const extractedAnswerContent = extractTerminalAnswerBlocks(renderedContent);
  const articleContent = extractedAnswerContent.articleContent;
  const featuredImage = extractFirstImage(articleContent);
  const contentWithoutFeaturedImage = featuredImage ? removeFirstImage(articleContent) : articleContent;
  const excerpt = post.excerpt;
  const keywords = deriveKeywords(post.metadata.title, excerpt, articleContent);

  usePageMetadata({
    title: post.metadata.title,
    description: excerpt,
    image: featuredImage?.src,
    imageAlt: featuredImage?.alt || post.metadata.title,
    keywords,
    path: `/blog/${post.slug}`,
    structuredData: [
      buildBlogPostingSchema({
        title: post.metadata.title,
        description: excerpt,
        path: `/blog/${post.slug}`,
        datePublished: post.metadata.date,
        author: post.metadata.author,
        image: featuredImage?.src,
        keywords,
      }),
      buildBreadcrumbSchema([
        { name: 'MdWrk', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: post.metadata.title, path: `/blog/${post.slug}` },
      ]),
    ],
  });

  return (
    <div className="lander-blog-shell blog-shell is-post">
      <div className="blog-post-layout">
        <Link to="/blog" className="blog-back-button">
          <ArrowLeft className="blog-back-icon" />
          Back to Blog
        </Link>
        <div className="lander-content-card blog-post-card">
          <div className="blog-post-header">
            <div className="blog-post-meta">
              <Link to={`/blog/archive/${post.monthSlug}`} className="blog-post-meta-item blog-post-meta-link">
                <Calendar className="blog-post-meta-icon" /> <time dateTime={post.metadata.date}>{post.displayDate}</time>
              </Link>
              <Link to={`/blog/author/${post.authorSlug}`} className="blog-post-meta-item blog-post-meta-link">
                <User className="blog-post-meta-icon" /> {post.metadata.author}
              </Link>
            </div>
            <h1 className="blog-post-title">{post.metadata.title}</h1>
          </div>
          {featuredImage?.src ? (
            <FeaturedImage
              src={featuredImage.src}
              alt={featuredImage.alt || post.metadata.title}
            />
          ) : null}
          <MarkdownViewer content={contentWithoutFeaturedImage} />
        </div>
        <AnswerBlocks blocks={extractedAnswerContent.answerBlocks} title="Article Guide" />
      </div>
    </div>
  );
};

const BlogAuthorArchivePage: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
  const { authorSlug } = useParams();
  const filteredPosts = posts.filter(post => post.authorSlug === authorSlug);
  if (filteredPosts.length === 0) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <BlogList
      posts={filteredPosts}
      eyebrow="Author Archive"
      title={filteredPosts[0]?.metadata.author ?? 'Author'}
    />
  );
};

const BlogMonthArchivePage: React.FC<{ posts: BlogPost[] }> = ({ posts }) => {
  const { monthSlug } = useParams();
  const filteredPosts = posts.filter(post => post.monthSlug === monthSlug);
  if (filteredPosts.length === 0) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <BlogList
      posts={filteredPosts}
      eyebrow="Monthly Archive"
      title={filteredPosts[0]?.monthLabel || monthSlug || 'Archive'}
    />
  );
};

export const BlogView: React.FC = () => {
  const posts = useMemo(() => getBlogPosts(), []);

  return (
    <Routes>
      <Route index element={<BlogList posts={posts} title="Blog" />} />
      <Route path="author/:authorSlug" element={<BlogAuthorArchivePage posts={posts} />} />
      <Route path="archive/:monthSlug" element={<BlogMonthArchivePage posts={posts} />} />
      <Route path=":postSlug" element={<BlogPostPage posts={posts} />} />
      <Route path="*" element={<Navigate to="/blog" replace />} />
    </Routes>
  );
};
