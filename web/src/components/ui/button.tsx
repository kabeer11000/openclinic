import { component$, Slot } from '@builder.io/qwik';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  class?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick$?: () => void;
}

const getButtonClasses = (variant: ButtonVariant = 'default', size: ButtonSize = 'default') => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

  const variantClasses = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeClasses = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-8',
    icon: 'h-9 w-9',
  };

  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
};

export const Button = component$<ButtonProps>((props) => {
  const {
    variant = 'default',
    size = 'default',
    class: className,
    disabled,
    type = 'button',
    onClick$,
    ...rest
  } = props;

  return (
    <button
      class={cn(getButtonClasses(variant, size), className)}
      disabled={disabled}
      type={type}
      onClick$={onClick$}
      {...rest}
    >
      <Slot />
    </button>
  );
});
