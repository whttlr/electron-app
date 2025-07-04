import * as React from 'react';
import { cn } from './utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    className, cols = 1, gap = 'md', responsive = true, ...props
  }, ref) => (
      <div
        ref={ref}
        className={cn(
          'grid',
          // Column classes
          cols === 1 && 'grid-cols-1',
          cols === 2 && responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
          cols === 3 && responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
          cols === 4 && responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
          cols === 5 && responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-5',
          cols === 6 && responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-6',
          cols === 7 && 'grid-cols-7',
          cols === 8 && 'grid-cols-8',
          cols === 9 && 'grid-cols-9',
          cols === 10 && 'grid-cols-10',
          cols === 11 && 'grid-cols-11',
          cols === 12 && 'grid-cols-12',
          // Gap classes
          gap === 'none' && 'gap-0',
          gap === 'sm' && 'gap-2',
          gap === 'md' && 'gap-4',
          gap === 'lg' && 'gap-6',
          gap === 'xl' && 'gap-8',
          className,
        )}
        {...props}
      />
  ),
);
Grid.displayName = 'Grid';

export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({
    className, colSpan = 1, rowSpan = 1, ...props
  }, ref) => (
      <div
        ref={ref}
        className={cn(
          // Column span classes
          colSpan === 1 && 'col-span-1',
          colSpan === 2 && 'col-span-2',
          colSpan === 3 && 'col-span-3',
          colSpan === 4 && 'col-span-4',
          colSpan === 5 && 'col-span-5',
          colSpan === 6 && 'col-span-6',
          colSpan === 7 && 'col-span-7',
          colSpan === 8 && 'col-span-8',
          colSpan === 9 && 'col-span-9',
          colSpan === 10 && 'col-span-10',
          colSpan === 11 && 'col-span-11',
          colSpan === 12 && 'col-span-12',
          // Row span classes
          rowSpan === 1 && 'row-span-1',
          rowSpan === 2 && 'row-span-2',
          rowSpan === 3 && 'row-span-3',
          rowSpan === 4 && 'row-span-4',
          rowSpan === 5 && 'row-span-5',
          rowSpan === 6 && 'row-span-6',
          className,
        )}
        {...props}
      />
  ),
);
GridItem.displayName = 'GridItem';

// CNC-specific grid variants
const DashboardGrid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    className, cols = 4, gap = 'lg', ...props
  }, ref) => (
      <Grid
        ref={ref}
        cols={cols}
        gap={gap}
        className={cn(
          'min-h-[600px] auto-rows-fr',
          className,
        )}
        {...props}
      />
  ),
);
DashboardGrid.displayName = 'DashboardGrid';

const ControlGrid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    className, cols = 3, gap = 'md', ...props
  }, ref) => (
      <Grid
        ref={ref}
        cols={cols}
        gap={gap}
        responsive={false}
        className={cn(
          'h-full',
          className,
        )}
        {...props}
      />
  ),
);
ControlGrid.displayName = 'ControlGrid';

const JogGrid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    className, cols = 3, gap = 'sm', ...props
  }, ref) => (
      <Grid
        ref={ref}
        cols={cols}
        gap={gap}
        responsive={false}
        className={cn(
          'max-w-xs mx-auto',
          className,
        )}
        {...props}
      />
  ),
);
JogGrid.displayName = 'JogGrid';

export {
  Grid, GridItem, DashboardGrid, ControlGrid, JogGrid,
};
