import React from 'react';
import { Link, useParams } from 'react-router-dom';
import MotionReveal from '../../motion/MotionReveal.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import { formatBlogDate, getBlogPost } from './blogData.js';
import './Blog.css';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="mmc-blog-page">
        <div className="container">
          <div className="mmc-blog-empty">
            <span className="mmc-blog-empty-icon">
              <OutlineIcon name="book" size={28} />
            </span>
            <h2>Post not found</h2>
            <p>This note may have moved. Browse the latest guidance instead.</p>
            <Link to="/blog" className="btn btn-ink">Back to Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="mmc-blog-page mmc-blog-article">
      <div className="container mmc-blog-article-inner">
        <MotionReveal>
          <Link to="/blog" className="mmc-blog-back">
            <OutlineIcon name="arrow" size={16} />
            All posts
          </Link>
          <span className="mmc-blog-cat">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="mmc-blog-article-meta">
            {post.author} · {formatBlogDate(post.date)}
          </p>
        </MotionReveal>

        <MotionReveal delay={80} className="mmc-blog-article-media">
          <img src={post.image} alt="" />
        </MotionReveal>

        <MotionReveal delay={120} className="mmc-blog-article-body">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </MotionReveal>
      </div>
    </article>
  );
}
