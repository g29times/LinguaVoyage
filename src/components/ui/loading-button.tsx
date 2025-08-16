import { Button, type ButtonProps } from './button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  clickCount?: number;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  clickCount = 0,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <div className="space-y-2">
      <Button
        className={cn(className)}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? (loadingText || 'Loading...') : children}
      </Button>
      
      {clickCount > 1 && (
        <p className="text-sm text-orange-600 text-center animate-pulse">
          请不要重复点击 (已点击 {clickCount} 次)
        </p>
      )}
      
      {loading && (
        <p className="text-sm text-blue-600 text-center">
          正在创建您的学习档案...请稍等片刻
        </p>
      )}
    </div>
  );
}