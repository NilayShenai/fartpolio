export interface FeedItem {
  id: string;
  date: string;
  type: 'code' | 'audio' | 'sketch' | 'cook' | 'note';
  title: string;
  url?: string;
  description?: string;
  mediaUrl?: string;
  postSlug?: string;
}

// 1. Discover all audio and sketch binaries
const audioModules = import.meta.glob('/src/audio/*.{mp3,wav,ogg,m4a}', { eager: true, query: '?url' });
const sketchModules = import.meta.glob('/src/sketches/*.{jpg,jpeg,png,gif,webp,svg}', { eager: true, query: '?url' });

// 2. Discover description text files for audio and sketches
const audioDescModules = import.meta.glob('/src/audio/*.{txt,md}', { eager: true, query: '?raw' });
const sketchDescModules = import.meta.glob('/src/sketches/*.{txt,md}', { eager: true, query: '?raw' });

// 3. Discover cooking and coding text logs
const cookModules = import.meta.glob('/src/cook/*.{txt,md}', { eager: true, query: '?raw' });
const codeModules = import.meta.glob('/src/code/*.{txt,md}', { eager: true, query: '?raw' });

const loadedFeedItems: FeedItem[] = [];

// Helper to format title
const cleanTitle = (raw: string) => raw.replace(/-/g, ' ');

// Parse Audio Descriptions map
const audioDescs: Record<string, string> = {};
Object.entries(audioDescModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  audioDescs[fileName] = ((module as any).default || module).trim();
});

// Parse Sketch Descriptions map
const sketchDescs: Record<string, string> = {};
Object.entries(sketchDescModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  sketchDescs[fileName] = ((module as any).default || module).trim();
});

// Parse Audio Modules
Object.entries(audioModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (match) {
    const [, date, title] = match;
    loadedFeedItems.push({
      id: `audio-${fileName}`,
      date,
      type: 'audio',
      title: cleanTitle(title),
      mediaUrl: (module as any).default || module,
      description: audioDescs[fileName] || undefined
    });
  }
});

// Parse Sketch Modules
Object.entries(sketchModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (match) {
    const [, date, title] = match;
    loadedFeedItems.push({
      id: `sketch-${fileName}`,
      date,
      type: 'sketch',
      title: cleanTitle(title),
      mediaUrl: (module as any).default || module,
      description: sketchDescs[fileName] || undefined
    });
  }
});

// Parse Cook Logs
Object.entries(cookModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (match) {
    const [, date, title] = match;
    const rawContent = (module as any).default || module;
    loadedFeedItems.push({
      id: `cook-${fileName}`,
      date,
      type: 'cook',
      title: cleanTitle(title),
      description: rawContent.trim() || undefined
    });
  }
});

// Parse Code Logs
Object.entries(codeModules).forEach(([path, module]) => {
  const fileName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  if (match) {
    const [, date, title] = match;
    const rawContent = (module as any).default || module;
    
    let url: string | undefined = undefined;
    let description = rawContent.trim();
    
    if (description.startsWith('http://') || description.startsWith('https://')) {
      const lines = description.split('\n');
      url = lines[0].trim();
      description = lines.slice(1).join('\n').trim();
    }

    loadedFeedItems.push({
      id: `code-${fileName}`,
      date,
      type: 'code',
      title: cleanTitle(title),
      url,
      description: description || undefined
    });
  }
});

export const staticFeedItems: FeedItem[] = loadedFeedItems.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
