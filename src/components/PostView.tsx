import { useState, useEffect } from 'react';
import type { PostItem } from '../utils/postsLoader';
import { parseTooltipDOM } from '../utils/tooltipParser';

interface PostViewProps {
  post: PostItem;
  onBack: () => void;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function PostView({ post, onBack }: PostViewProps) {
  const PostComponent = post.Component;
  const [headings, setHeadings] = useState<TocItem[]>([]);

  useEffect(() => {
    // Scroll window back to top when a post is opened
    window.scrollTo(0, 0);

    // Wait a brief moment for MDX components to mount fully
    const timer = setTimeout(() => {
      const container = document.querySelector('.markdown-body');
      if (!container) return;

      // Parse and replace tooltip syntaxes inside the post body DOM
      parseTooltipDOM(container as HTMLElement);

      const headingElements = container.querySelectorAll('h1, h2');
      const items: TocItem[] = [];

      headingElements.forEach((el, index) => {
        const text = el.textContent || '';
        // Generate unique slugified ID if element doesn't have one
        const id = el.id || `section-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        el.id = id;

        items.push({
          id,
          text,
          level: el.tagName === 'H1' ? 2 : 3
        });
      });

      setHeadings(items);
    }, 50);

    return () => clearTimeout(timer);
  }, [post.slug]);

  return (
    <div className="post-container">
      <button className="post-back" onClick={onBack}>
        &lt;- back to logs
      </button>
      <div className="post-header">
        <h1 className="post-title">{post.title}</h1>
        <div className="post-date">{post.date}</div>
      </div>
      
      <div className="post-layout-wrapper">
        <div className="markdown-body">
          <PostComponent />
        </div>

        {headings.length > 0 && (
          <aside className="post-toc">
            <div className="toc-title">contents</div>
            <div className="toc-list">
              {headings.map((item) => (
                <a 
                  key={item.id} 
                  href={`#${item.id}`}
                  className={`toc-item level-${item.level}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="toc-line"></span>
                  <span className="toc-text">{item.text}</span>
                </a>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
