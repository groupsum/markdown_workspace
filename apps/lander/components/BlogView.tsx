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

export const BlogView: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const posts = Object.keys(contentFiles)
    .filter(path => path.startsWith('blog/'))
    .map(path => ({
      id: path,
      ...parseMarkdown(contentFiles[path as keyof typeof contentFiles])
    }));

  if (selectedPost) {
    const post = posts.find(p => p.id === selectedPost);
    return (
      <div className="lander-blog-shell pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedPost(null)}
            className="flex items-center gap-2 text-[var(--lander-fg-muted)] hover:text-[var(--lander-accent)] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </button>
          <div className="lander-content-card rounded-[24px] p-6 md:p-10">
            <div className="mb-8 border-b border-[var(--lander-border)] pb-8">
              <div className="flex gap-4 text-xs text-[var(--lander-fg-muted)] mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post?.metadata.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post?.metadata.author}</span>
              </div>
              <h1 className="text-4xl font-extrabold text-[var(--lander-fg)]">{post?.metadata.title}</h1>
            </div>
            <MarkdownViewer content={removeDuplicateLeadingHeading(post?.content || '', post?.metadata.title)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lander-blog-shell pt-32 pb-20 px-4">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-4xl font-extrabold text-[var(--lander-fg)] mb-12 text-center">mdwrk <span className="text-[var(--lander-accent)]">Blog</span></h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="lander-content-card p-6 rounded-2xl border hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="text-xs text-[var(--lander-accent)] font-bold mb-2 uppercase tracking-widest">{post.metadata.date}</div>
              <h2 className="text-xl font-bold text-[var(--lander-fg)] mb-3 group-hover:text-[var(--lander-accent)] transition-colors">{post.metadata.title}</h2>
              <p className="text-[var(--lander-fg-muted)] text-sm line-clamp-3 mb-4">{post.metadata.excerpt}</p>
              <div className="flex items-center gap-2 text-xs text-[var(--lander-fg-subtle)]">
                <User className="w-3 h-3" /> {post.metadata.author}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
