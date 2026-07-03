import { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button 
      onClick={() => setCount(c => c + 1)}
      style={{
        background: '#111016',
        border: '1px solid var(--border-color)',
        color: 'var(--accent-wisteria)',
        fontFamily: 'var(--mono-font)',
        padding: '8px 16px',
        cursor: 'pointer',
        marginTop: '12px',
        fontSize: '14px',
        transition: 'border-color 0.15s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-wisteria)'}
      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      [ count: {count} ]
    </button>
  );
}

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#111016',
      borderLeft: '3px solid var(--accent-wisteria)',
      padding: '12px 16px',
      margin: '20px 0',
      fontSize: '15px',
      color: 'var(--text-primary)',
      lineHeight: '1.6'
    }}>
      {children}
    </div>
  );
}

export function InteractiveVisualizer() {
  const [bars, setBars] = useState<number[]>([30, 50, 45, 60, 20, 45, 30, 55, 40, 25, 50, 35]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.floor(Math.random() * 60) + 15));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      background: '#111016',
      border: '1px solid var(--border-color)',
      padding: '16px',
      margin: '24px 0',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: '6px',
      height: '100px',
      borderRadius: '2px'
    }}>
      {bars.map((height, i) => (
        <div 
          key={i} 
          style={{
            width: '14px',
            height: `${height}px`,
            background: 'var(--accent-wisteria)',
            opacity: 0.85,
            transition: 'height 0.15s ease-in-out'
          }}
        />
      ))}
    </div>
  );
}
