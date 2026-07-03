import { useState, useEffect } from 'react';
import { posts, getPostBySlug } from './utils/postsLoader';
import { staticFeedItems } from './utils/assetsLoader';
import { FeedList } from './components/FeedList';
import { PostView } from './components/PostView';
import { GithubContributions } from './components/GithubContributions';

type Tab = 'home' | 'blog' | 'about';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subArchive, setSubArchive] = useState<'notes' | 'audio'>('notes');

  // Case-insensitive token matching search algorithm
  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const content = `${post.title} ${post.description || ''} ${post.date}`.toLowerCase();
    return tokens.every(token => content.includes(token));
  });

  const filteredAudio = staticFeedItems.filter(item => {
    if (item.type !== 'audio') return false;
    if (!searchQuery.trim()) return true;
    const tokens = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const content = `${item.title} ${item.description || ''} ${item.date}`.toLowerCase();
    return tokens.every(token => content.includes(token));
  });

  const handleSubArchiveChange = (type: 'notes' | 'audio') => {
    setSubArchive(type);
    setSearchQuery('');
  };

  // URL State management for tabs and posts
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = (params.get('tab') as Tab) || 'home';
      const postParam = params.get('post');
      
      setActiveTab(tabParam);
      setSelectedPostSlug(postParam);
    };

    const params = new URLSearchParams(window.location.search);
    const tabParam = (params.get('tab') as Tab) || 'home';
    const postParam = params.get('post');

    setActiveTab(tabParam);
    setSelectedPostSlug(postParam);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSelectedPostSlug(null); // Clear active post when shifting tabs
    
    const params = new URLSearchParams();
    params.set('tab', tab);
    const newUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ tab }, '', newUrl);
  };

  const handleSelectPost = (slug: string) => {
    setSelectedPostSlug(slug);
    
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    params.set('post', slug);
    const newUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ tab: activeTab, post: slug }, '', newUrl);
  };

  const handleClearPost = () => {
    setSelectedPostSlug(null);
    
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    const newUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ tab: activeTab }, '', newUrl);
  };

  const activePost = selectedPostSlug ? getPostBySlug(selectedPostSlug) : undefined;

  return (
    <div className="container">
      <header>
        <div className="header-top">
          <span className="logo" onClick={() => handleTabChange('home')}>
            nilay d. shenai
          </span>
          <nav className="nav-bar">
            <button 
              className={`nav-link ${activeTab === 'home' && !activePost ? 'active' : ''}`}
              onClick={() => handleTabChange('home')}
            >
              [home]
            </button>
            <button 
              className={`nav-link ${activeTab === 'blog' || activePost ? 'active' : ''}`}
              onClick={() => handleTabChange('blog')}
            >
              [archives]
            </button>
            <button 
              className={`nav-link ${activeTab === 'about' && !activePost ? 'active' : ''}`}
              onClick={() => handleTabChange('about')}
            >
              [about]
            </button>
          </nav>
        </div>
        <div className="bio">writing, bs, and other artifacts.</div>
      </header>

      {activePost ? (
        <PostView post={activePost} onBack={handleClearPost} />
      ) : (
        <>
          {activeTab === 'home' && (
            <>
              <GithubContributions username="NilayShenai" />
              <div className="section-title" style={{ marginTop: '24px' }}>recent activity</div>
              <FeedList 
                posts={posts}
                staticItems={staticFeedItems}
                activeFilter="all"
                limit={3}
                onSelectPost={handleSelectPost}
              />

              <div className="section-title" style={{ marginTop: '32px' }}>wall of shame</div>
              <div className="shame-list">
                <div className="shame-item">
                  <div className="shame-item-header">
                    <a 
                      className="shame-item-title" 
                      href="https://github.com/NilayShenai/Werunos" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      werunos
                    </a>
                  </div>
                  <div className="shame-item-desc">
                    lightweight userspace ext4 & btrfs filesystem driver for windows via winfsp. native mount support.
                  </div>
                </div>

                <div className="shame-item">
                  <div className="shame-item-header">
                    <a 
                      className="shame-item-title" 
                      href="https://github.com/NilayShenai/OSiris" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      osiris
                    </a>
                  </div>
                  <div className="shame-item-desc">
                    a monolithic x86_64 hobby operating system kernel written from scratch in c and assembly.
                  </div>
                </div>

                <div className="shame-item">
                  <div className="shame-item-header">
                    <a 
                      className="shame-item-title" 
                      href="https://github.com/NilayShenai/Songbird" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      songbird
                    </a>
                  </div>
                  <div className="shame-item-desc">
                    6-voice hybrid polyphonic web synthesizer built using the web audio api and custom audio worklets.
                  </div>
                </div>

                <div className="shame-item">
                  <div className="shame-item-header">
                    <a 
                      className="shame-item-title" 
                      href="https://github.com/NilayShenai/Puh" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      puh
                    </a>
                  </div>
                  <div className="shame-item-desc">
                    a deterministic continuous image format using anisotropic Gaussian splats.
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'blog' && (
            <>
              <div className="archive-selector">
                <button 
                  className={`archive-btn ${subArchive === 'notes' ? 'active' : ''}`}
                  onClick={() => handleSubArchiveChange('notes')}
                >
                  notes archive
                </button>
                <span className="archive-separator"> / </span>
                <button 
                  className={`archive-btn ${subArchive === 'audio' ? 'active' : ''}`}
                  onClick={() => handleSubArchiveChange('audio')}
                >
                  audio archive
                </button>
              </div>

              <div className="search-container">
                <span className="search-prefix">[ search: </span>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder={`filter ${subArchive}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className="search-suffix"> ]</span>
              </div>

              {subArchive === 'notes' ? (
                <FeedList 
                  posts={filteredPosts}
                  staticItems={[]}
                  activeFilter="notes"
                  onSelectPost={handleSelectPost}
                />
              ) : (
                <FeedList 
                  posts={[]}
                  staticItems={filteredAudio}
                  activeFilter="audio"
                  onSelectPost={handleSelectPost}
                />
              )}
            </>
          )}

          {activeTab === 'about' && (
            <div style={{ marginTop: '0px', lineHeight: '1.8' }}>
              <div className="section-title" style={{ marginTop: '0px' }}>ME</div>
              <p style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>
                a flesh automaton animated by neurotransmitters.
              </p>
              
              <div style={{ margin: '24px 0', borderLeft: '2px solid var(--border-color)', paddingLeft: '16px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-wisteria)', marginBottom: '8px' }}>[ I do ]</div>
                <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>- low level crap</li>
                  <li>- high level crap</li>
                  <li>- monolithic kernel designs (x86_64 OS from absolute scratch)</li>
                  <li>- DSP, polyphonic synthesis, and low-latency custom web audio worklets</li>
                  <li>- I cook</li>
                  <li>- some generic performative art shit</li>
                </ul>
              </div>

              <div style={{ marginTop: '32px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--accent-wisteria)', marginBottom: '8px' }}>[ contact ]</div>
                <table style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--text-muted)', paddingRight: '16px', paddingTop: '4px', paddingBottom: '4px' }}>github</td>
                      <td style={{ paddingTop: '4px', paddingBottom: '4px' }}><a href="https://github.com/NilayShenai" target="_blank" rel="noopener noreferrer">github.com/NilayShenai</a></td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-muted)', paddingRight: '16px', paddingTop: '4px', paddingBottom: '4px' }}>instagram</td>
                      <td style={{ paddingTop: '4px', paddingBottom: '4px' }}><a href="https://www.instagram.com/nilay_shenai" target="_blank" rel="noopener noreferrer">instagram.com/nilay_shenai</a></td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-muted)', paddingRight: '16px', paddingTop: '4px', paddingBottom: '4px' }}>email</td>
                      <td style={{ paddingTop: '4px', paddingBottom: '4px' }}><a href="mailto:nilayshenai@gmail.com">nilayshenai@gmail.com</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <footer>
        &copy; {new Date().getFullYear()} nilay d. shenai. blogs from underground.
      </footer>
    </div>
  );
}

export default App;
