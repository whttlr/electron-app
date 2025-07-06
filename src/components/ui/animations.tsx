import * as React from 'react';
import { cn } from './utils';

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'fade' | 'slide' | 'scale';
  className?: string;
}

export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, mode = 'fade', className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }, []);

    const modeClasses = {
      fade: isVisible
        ? 'opacity-100 transition-opacity duration-500 ease-in-out'
        : 'opacity-0 transition-opacity duration-500 ease-in-out',
      slide: isVisible
        ? 'translate-y-0 opacity-100 transition-all duration-500 ease-out'
        : 'translate-y-4 opacity-0 transition-all duration-500 ease-out',
      scale: isVisible
        ? 'scale-100 opacity-100 transition-all duration-300 ease-out'
        : 'scale-95 opacity-0 transition-all duration-300 ease-out',
    };

    return (
      <div ref={ref} className={cn(modeClasses[mode], className)}>
        {children}
      </div>
    );
  },
);
PageTransition.displayName = 'PageTransition';

interface SectionTransitionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const SectionTransition = React.forwardRef<HTMLDivElement, SectionTransitionProps>(
  ({ children, delay = 0, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }, [delay]);

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-700 ease-out',
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-8 opacity-0',
          className,
        )}
      >
        {children}
      </div>
    );
  },
);
SectionTransition.displayName = 'SectionTransition';

interface StaggerChildrenProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerChildren = React.forwardRef<HTMLDivElement, StaggerChildrenProps>(
  ({ children, staggerDelay = 100, className }, ref) => {
    const [visibleChildren, setVisibleChildren] = React.useState(new Set<number>());

    const childrenArray = React.Children.toArray(children);

    React.useEffect(() => {
      childrenArray.forEach((_, index) => {
        const timer = setTimeout(() => {
          setVisibleChildren((prev) => new Set([...prev, index]));
        }, index * staggerDelay);

        return () => clearTimeout(timer);
      });
    }, [childrenArray.length, staggerDelay]);

    return (
      <div ref={ref} className={className}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className={cn(
              'transition-all duration-500 ease-out',
              visibleChildren.has(index)
                ? 'translate-y-0 opacity-100'
                : 'translate-y-6 opacity-0',
            )}
          >
            {child}
          </div>
        ))}
      </div>
    );
  },
);
StaggerChildren.displayName = 'StaggerChildren';

interface AnimatedCardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, hover = true, className }, ref) => (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-300 ease-out transform-gpu',
          hover && 'hover:scale-[1.02] hover:shadow-lg hover:-translate-y-1',
          'active:scale-[0.98]',
          className,
        )}
      >
        {children}
      </div>
  ),
);
AnimatedCard.displayName = 'AnimatedCard';
