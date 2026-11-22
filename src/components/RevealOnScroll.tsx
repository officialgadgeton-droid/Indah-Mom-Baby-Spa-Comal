import React, { useEffect, useRef, useState } from 'react';

export type RevealVariant = 'fade-up' | 'fade-left' | 'fade-right' | 'zoom-in';

export interface RevealOnScrollProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number; // Delay in milliseconds for stagger effect
  className?: string;
  as?: React.ElementType;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  variant = 'fade-up',
  delay = 0,
  className = '',
  as: Component = 'div',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // If browser doesn't support IntersectionObserver, reveal immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) {
              observer.unobserve(domRef.current);
            }
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const currentEl = domRef.current;
    if (currentEl) {
      observer.observe(currentEl);
    }

    return () => {
      if (currentEl) {
        observer.unobserve(currentEl);
      }
    };
  }, []);

  // Compute CSS transition classes based on variant & state
  const getVariantClasses = () => {
    switch (variant) {
      case 'fade-left':
        return isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 -translate-x-8';
      case 'fade-right':
        return isVisible
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-8';
      case 'zoom-in':
        return isVisible
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-95';
      case 'fade-up':
      default:
        return isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6';
    }
  };

  return (
    <Component
      ref={domRef}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-all duration-700 ease-out will-change-[transform,opacity] ${getVariantClasses()} ${className}`}
    >
      {children}
    </Component>
  );
};
