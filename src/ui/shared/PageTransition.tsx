import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cn } from './utils';

export interface PageTransitionProps {
  children: React.ReactNode
  mode?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'slideDown'
  duration?: number
  className?: string
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  mode = 'fade',
  duration = 0.3,
  className,
}) => {
  const location = useLocation();

  const pageVariants = {
    fade: {
      initial: { opacity: 0 },
      in: { opacity: 1 },
      out: { opacity: 0 },
    },
    slide: {
      initial: { opacity: 0, x: -100 },
      in: { opacity: 1, x: 0 },
      out: { opacity: 0, x: 100 },
    },
    slideUp: {
      initial: { opacity: 0, y: 100 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: -100 },
    },
    slideDown: {
      initial: { opacity: 0, y: -100 },
      in: { opacity: 1, y: 0 },
      out: { opacity: 0, y: 100 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      in: { opacity: 1, scale: 1 },
      out: { opacity: 0, scale: 1.05 },
    },
  };

  const variants = pageVariants[mode];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={variants}
        transition={{ duration, ease: 'easeInOut' }}
        className={cn('w-full h-full', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export interface SectionTransitionProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  className,
}) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
);

export interface StaggerChildrenProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

export const StaggerChildren: React.FC<StaggerChildrenProps> = ({
  children,
  staggerDelay = 0.1,
  className,
}) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
);

export interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  hover?: boolean
  className?: string
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(({
  children,
  delay = 0,
  hover = true,
  className,
}, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={hover ? { scale: 1.02, transition: { duration: 0.2 } } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      className={className}
    >
      {children}
    </motion.div>
));
AnimatedCard.displayName = 'AnimatedCard';

export interface LoadingTransitionProps {
  isLoading: boolean
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  className?: string
}

export const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  loadingComponent,
  className,
}) => (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn('flex items-center justify-center h-full', className)}
        >
          {loadingComponent || (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full"
              />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
);

// Hook for programmatic animations
export const usePageAnimation = () => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const triggerAnimation = React.useCallback((duration: number = 300) => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), duration);
  }, []);

  return { isAnimating, triggerAnimation };
};
