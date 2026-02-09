import React, { useState } from 'react';
import { contentFiles } from '../data/content';
import { parseMarkdown } from '../utils/markdownParser';
import { MarkdownViewer } from './MarkdownViewer';
import { Calendar, User, ArrowLeft } from 'lucide-react';

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
      <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
        <button 
          onClick={() => setSelectedPost(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-500 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </button>
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
           <div className="flex gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post?.metadata.date}</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post?.metadata.author}</span>
           </div>
           <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{post?.metadata.title}</h1>
        </div>
        <MarkdownViewer content={post?.content || ''} />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-screen-xl mx-auto">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-12 text-center">Engineering <span className="text-indigo-500">Blog</span></h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <article 
            key={post.id}
            onClick={() => setSelectedPost(post.id)}
            className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div className="text-xs text-indigo-500 font-bold mb-2 uppercase tracking-widest">{post.metadata.date}</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-500 transition-colors">{post.metadata.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4">{post.metadata.excerpt}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
               <User className="w-3 h-3" /> {post.metadata.author}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};