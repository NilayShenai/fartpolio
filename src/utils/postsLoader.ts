import React from 'react';

export interface PostMetadata {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
}

export interface PostItem {
  slug: string;
  type: 'note';
  date: string;
  title: string;
  description?: string;
  Component: React.ComponentType;
}

// Import all md and mdx files from the posts directory
const postModules = import.meta.glob<{
  default: React.ComponentType;
  metadata: PostMetadata;
}>('/src/posts/*.{md,mdx}', { eager: true });

const loadedPosts: PostItem[] = Object.keys(postModules).map((path) => {
  const module = postModules[path];
  const slug = path.split('/').pop()?.replace(/\.(md|mdx)$/, '') || '';
  
  if (!module.metadata) {
    console.warn(`Post at ${path} is missing export const metadata = { ... }`);
  }

  return {
    slug,
    type: 'note',
    date: module.metadata?.date || '1970-01-01',
    title: module.metadata?.title || slug,
    description: module.metadata?.description,
    Component: module.default
  };
});

// Sort posts by date descending
export const posts: PostItem[] = loadedPosts.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export function getPostBySlug(slug: string): PostItem | undefined {
  return posts.find((post) => post.slug === slug);
}
