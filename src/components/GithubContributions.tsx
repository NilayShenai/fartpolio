import { useState, useEffect } from 'react';

interface ContributionDay {
  color: string;
  contributionCount: number;
  contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE' | string;
  date: string;
}

interface ContributionData {
  contributions: ContributionDay[][];
}

const CACHE_KEY = 'github_contributions_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function GithubContributions({ username }: { username: string }) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION_MS) {
            setData(cachedData);
            setLoading(false);
            return;
          }
        }

        const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
        if (!response.ok) throw new Error('Failed to fetch contributions');
        
        const json = await response.json();
        setData(json);

        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: json,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Error loading GitHub contributions:', err);
        // Fallback to expired cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData } = JSON.parse(cached);
          setData(cachedData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading || !data || !data.contributions) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '10px 0' }}>
        [loading contribution graph...]
      </div>
    );
  }

  // Get color for contribution level matching our wisteria palette
  const getColor = (level: string) => {
    switch (level) {
      case 'NONE':
        return '#131118'; // Dark charcoal, slightly lighter than background
      case 'FIRST_QUARTILE':
        return '#2C273B'; // Muted dark wisteria
      case 'SECOND_QUARTILE':
        return '#4E4369'; // Mid wisteria-violet
      case 'THIRD_QUARTILE':
        return '#7869A0'; // Lighter wisteria
      case 'FOURTH_QUARTILE':
        return '#B3A8D4'; // Highlight wisteria (accent)
      default:
        return '#131118';
    }
  };

  const weeks = data.contributions;
  const stride = 16;
  const boxSize = 12;
  const svgWidth = weeks.length * stride + 4;
  const svgHeight = 7 * stride + 8; // 120

  return (
    <div style={{ margin: '0 0 32px 0' }}>
      <div className="contrib-chart-wrapper">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          width="100%" 
          style={{ display: 'block' }}
        >
          <g transform="translate(2, 4)">
            {weeks.map((week, weekIndex) => (
              <g key={weekIndex} transform={`translate(${weekIndex * stride}, 0)`}>
                {week.map((day, dayIndex) => (
                  <rect
                    key={dayIndex}
                    y={dayIndex * stride}
                    width={boxSize}
                    height={boxSize}
                    fill={getColor(day.contributionLevel)}
                    rx="1.5"
                    ry="1.5"
                  >
                    <title>{`${day.contributionCount} contributions on ${day.date}`}</title>
                  </rect>
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
