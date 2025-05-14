import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  centered?: boolean;
}

export function Spinner({ 
  size = 'md', 
  className,
  centered = false
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const spinner = (
    <Loader2 
      className={cn(
        'animate-spin text-accent', 
        sizeClasses[size], 
        className
      )} 
    />
  );

  if (centered) {
    return (
      <div className="flex justify-center items-center w-full h-full min-h-[100px]">
        {spinner}
      </div>
    );
  }

  return spinner;
} 