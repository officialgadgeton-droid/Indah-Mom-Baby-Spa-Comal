import React from 'react';

interface SpaBubblesProps {
  className?: string;
  count?: number;
}

export const SpaBubbles: React.FC<SpaBubblesProps> = ({ className = '', count = 6 }) => {
  // Pre-configured lightweight static bubbles for consistent rendering
  const bubbleStyles = [
    { top: '15%', left: '8%', size: 'w-4 h-4', border: 'border-accent/30 bg-accent/5', animDuration: '10s', animDelay: '0s' },
    { top: '45%', left: '4%', size: 'w-6 h-6', border: 'border-primary/25 bg-primary/5', animDuration: '13s', animDelay: '2s' },
    { top: '70%', left: '12%', size: 'w-3.5 h-3.5', border: 'border-accent/40 bg-accent/10', animDuration: '9s', animDelay: '1s' },
    { top: '25%', right: '7%', size: 'w-5 h-5', border: 'border-accent/35 bg-accent/5', animDuration: '11s', animDelay: '1.5s' },
    { top: '55%', right: '5%', size: 'w-7 h-7', border: 'border-primary/20 bg-primary/5', animDuration: '14s', animDelay: '3s' },
    { top: '80%', right: '11%', size: 'w-4 h-4', border: 'border-accent/30 bg-accent/5', animDuration: '12s', animDelay: '0.5s' },
    { top: '35%', left: '48%', size: 'w-3 h-3', border: 'border-accent/25 bg-accent/5', animDuration: '8s', animDelay: '2.5s' },
  ];

  const selectedBubbles = bubbleStyles.slice(0, count);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {selectedBubbles.map((b, i) => (
        <div
          key={i}
          style={{
            top: b.top,
            left: (b as any).left,
            right: (b as any).right,
            animation: `spaBubbleRise ${b.animDuration} ease-in-out infinite alternate`,
            animationDelay: b.animDelay,
          }}
          className={`absolute rounded-full border shadow-[0_0_10px_rgba(212,175,55,0.08)] backdrop-blur-[0.5px] ${b.size} ${b.border}`}
        >
          {/* Inner sparkle dot */}
          <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-white/70" />
        </div>
      ))}
    </div>
  );
};
