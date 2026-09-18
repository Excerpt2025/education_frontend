import React, { useMemo, useState } from 'react';
import BlogHeader from './BlogHeader.jsx';
import BlogSearch from './BlogSearch.jsx';
import BlogFilter from './BlogFilter.jsx';
import BlogGrid from './BlogGrid.jsx';
import BlogEmptyState from './BlogEmptyState.jsx';
import { BLOG_POSTS, filterBlogPosts, getBlogCategories } from './blogData.js';
import './Blog.css';

export default function Blog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => getBlogCategories(BLOG_POSTS), []);
  const posts = useMemo(
    () => filterBlogPosts(BLOG_POSTS, { query, category }),
    [query, category]
  );

  const clearAll = () => {
    setQuery('');
    setCategory('All');
  };

  return (
    <div className="mmc-blog-page">
      <div className="container">
        <BlogHeader />

        <div className="mmc-blog-toolbar">
          <BlogSearch value={query} onChange={setQuery} />
          <BlogFilter categories={categories} value={category} onChange={setCategory} />
        </div>

        <p className="mmc-blog-count">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'}
        </p>

        {posts.length ? (
          <BlogGrid posts={posts} />
        ) : (
          <BlogEmptyState onClear={clearAll} />
        )}
      </div>
    </div>
  );
}
