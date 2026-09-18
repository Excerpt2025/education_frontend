import React from 'react';
import { Link } from 'react-router-dom';
import ScrollCard from '../../motion/ScrollCard.jsx';
import { staggerDelay } from '../../motion/MotionReveal.jsx';
import OutlineIcon from '../../components/icons/OutlineIcon.jsx';
import { formatBlogDate } from './blogData.js';

export default function BlogCard({ post, index = 0 }) {
  return (
    <ScrollCard
      as={Link}
      to={`/blog/${post.slug}`}
      className="mmc-blog-card"
      index={index}
      delay={staggerDelay(index, 90)}
      aria-label={`${post.title}. ${post.excerpt}`}
    >
      <span className="mmc-blog-card-spin" aria-hidden="true" />
      <article className="mmc-blog-card-inner">
        <div className="mmc-blog-card-media">
          <img src={post.image} alt="" loading="lazy" />
        </div>
        <div className="mmc-blog-card-body">
          <span className="mmc-blog-cat">{post.category}</span>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <div className="mmc-blog-card-meta">
            <span>{post.author}</span>
            <span>{formatBlogDate(post.date)}</span>
          </div>
          <span className="mmc-blog-more">
            Read more <OutlineIcon name="arrow" size={14} />
          </span>
        </div>
      </article>
    </ScrollCard>
  );
}
