import React, { useState } from 'react';
import { contentFiles } from '../data/content';
import { parseMarkdown } from '../utils/markdownParser';
import { MarkdownViewer } from './MarkdownViewer';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const normalizeTitle = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, ' ');

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

export const BlogView: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const posts = Object.keys(contentFiles)
    .filter(path => path.startsWith('blog/'))
    .map(path => ({
      id: path,
      ...parseMarkdown(contentFiles[path as keyof typeof contentFiles])
    }))
    .filter((post) => {
      const title = post.metadata.title?.trim();
      const excerpt = post.metadata.excerpt?.trim();
      const author = post.metadata.author?.trim();
      const date = post.metadata.date?.trim();
      return Boolean(title && excerpt && author && date);
    })
    .sort((a, b) => {
      const dateSort = toPostTime(b.metadata.date) - toPostTime(a.metadata.date);
      if (dateSort !== 0) return dateSort;
      return (b.metadata.title || b.id).localeCompare(a.metadata.title || a.id);
    });

  if (selectedPost) {
    const post = posts.find(p => p.id === selectedPost);
    return (
      <div className="lander-blog-shell blog-shell is-post">
        <div className="blog-post-layout">
          <button
            onClick={() => setSelectedPost(null)}
            className="blog-back-button"
          >
            <ArrowLeft className="blog-back-icon" />
            Back to Blog
          </button>
          <div className="lander-content-card blog-post-card">
            <div className="blog-post-header">
              <div className="blog-post-meta">
                <span className="blog-post-meta-item"><Calendar className="blog-post-meta-icon" /> {post?.metadata.date}</span>
                <span className="blog-post-meta-item"><User className="blog-post-meta-icon" /> {post?.metadata.author}</span>
              </div>
              <h1 className="blog-post-title">{post?.metadata.title}</h1>
            </div>
            <MarkdownViewer content={removeDuplicateLeadingHeading(post?.content || '', post?.metadata.title)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lander-blog-shell blog-shell is-list">
      <div className="blog-list-layout">
        <h1 className="blog-list-title">
          <span className="blog-list-title-inner">Blog</span>
        </h1>
        <div className="blog-grid">
          {posts.map(post => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="lander-content-card blog-card"
            >
              <div className="blog-card-date">{post.metadata.date}</div>
              <h2 className="blog-card-title">{post.metadata.title}</h2>
              <p className="blog-card-excerpt">{post.metadata.excerpt}</p>
              <div className="blog-card-author">
                <User className="blog-card-author-icon" /> {post.metadata.author}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
