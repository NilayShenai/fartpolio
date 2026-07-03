import type { PostItem } from '../utils/postsLoader';
import type { FeedItem } from '../utils/assetsLoader';
import { AudioPlayer } from './AudioPlayer';
import { SketchViewer } from './SketchViewer';
import { parseTooltipText } from '../utils/tooltipParser';

interface FeedListProps {
  posts: PostItem[];
  staticItems: FeedItem[];
  activeFilter: 'all' | 'notes' | 'audio';
  limit?: number;
  onSelectPost: (slug: string) => void;
}

type CombinedItem = 
  | { type: 'note'; date: string; data: PostItem }
  | { type: 'audio' | 'sketch' | 'code' | 'cook'; date: string; data: FeedItem };

export function FeedList({ posts, staticItems, activeFilter, limit, onSelectPost }: FeedListProps) {
  const combined: CombinedItem[] = [];

  // Add posts if applicable
  if (activeFilter === 'all' || activeFilter === 'notes') {
    posts.forEach(post => {
      combined.push({ type: 'note', date: post.date, data: post });
    });
  }

  // Add static items if applicable
  if (activeFilter === 'all' || activeFilter === 'audio') {
    staticItems.forEach(item => {
      if (activeFilter === 'audio' && item.type === 'audio') {
        combined.push({ type: 'audio', date: item.date, data: item });
      } else if (activeFilter === 'all' && item.type !== 'note') {
        combined.push({ type: item.type, date: item.date, data: item });
      }
    });
  }

  // Sort by date descending using lexicographical comparison (robust and exact)
  const sorted = combined.sort((a, b) => {
    if (b.date !== a.date) {
      return b.date > a.date ? 1 : -1;
    }
    
    const typePrecedence = { note: 0, code: 1, audio: 2, sketch: 3, cook: 4 };
    const aType = a.type as keyof typeof typePrecedence;
    const bType = b.type as keyof typeof typePrecedence;
    return typePrecedence[aType] - typePrecedence[bType];
  });

  const displayItems = limit ? sorted.slice(0, limit) : sorted;

  if (displayItems.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0' }}>
        [no entries found]
      </div>
    );
  }

  return (
    <div className="timeline">
      {displayItems.map((item) => {
        const key = item.type === 'note' ? item.data.slug : item.data.id;
        
        return (
          <div className="timeline-item" key={key}>
            <div className="timeline-date">{item.date}</div>
            {activeFilter === 'all' && (
              <div className={`timeline-type ${item.type}`}>
                [{item.type}]
              </div>
            )}
            
            <div className="timeline-content">
              {item.type === 'note' && (
                <div>
                  <span 
                    className="timeline-title-link" 
                    onClick={() => onSelectPost((item.data as PostItem).slug)}
                  >
                    {(item.data as PostItem).title}
                  </span>
                  {(item.data as PostItem).description && (
                    <div className="timeline-desc">{parseTooltipText((item.data as PostItem).description)}</div>
                  )}
                </div>
              )}


              {item.type === 'code' && (
                <div>
                  {(item.data as FeedItem).url ? (
                    <a href={(item.data as FeedItem).url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 500 }}>
                      {(item.data as FeedItem).title}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 500 }}>{(item.data as FeedItem).title}</span>
                  )}
                  {(item.data as FeedItem).description && (
                    <div className="timeline-desc">{parseTooltipText((item.data as FeedItem).description)}</div>
                  )}
                </div>
              )}

              {item.type === 'audio' && (
                <div>
                  {(item.data as FeedItem).mediaUrl ? (
                    <a 
                      href={(item.data as FeedItem).mediaUrl} 
                      download={`${(item.data as FeedItem).title}.mp3`}
                      className="timeline-audio-download-link"
                      style={{ fontWeight: 500 }}
                    >
                      {(item.data as FeedItem).title}
                    </a>
                  ) : (
                    <span style={{ fontWeight: 500 }}>{(item.data as FeedItem).title}</span>
                  )}
                  {(item.data as FeedItem).description && (
                    <div className="timeline-desc">{parseTooltipText((item.data as FeedItem).description)}</div>
                  )}
                  {(item.data as FeedItem).mediaUrl && <AudioPlayer src={(item.data as FeedItem).mediaUrl!} />}
                </div>
              )}

              {item.type === 'sketch' && (
                <div>
                  <span style={{ fontWeight: 500 }}>{(item.data as FeedItem).title}</span>
                  {(item.data as FeedItem).description && (
                    <div className="timeline-desc">{parseTooltipText((item.data as FeedItem).description)}</div>
                  )}
                  {(item.data as FeedItem).mediaUrl && (
                    <SketchViewer src={(item.data as FeedItem).mediaUrl!} title={(item.data as FeedItem).title} />
                  )}
                </div>
              )}

              {item.type === 'cook' && (
                <div>
                  <span style={{ fontWeight: 500 }}>{(item.data as FeedItem).title}</span>
                  {(item.data as FeedItem).description && (
                    <div className="timeline-desc">{parseTooltipText((item.data as FeedItem).description)}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
