import { component$ } from '@builder.io/qwik';
import { cn } from '../../lib/utils';

interface InputProps {
  error?: string;
  class?: string;
  placeholder?: string;
  value?: string;
  type?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  min?: string;
  max?: string;
  step?: string;
  rows?: number;
  onInput$?: (event: Event) => void;
}

export const Input = component$<InputProps>((props) => {
  const { class: className, error, type = 'text', ...rest } = props;

  return (
    <div class="w-full">
      <input
        type={type}
        class={cn(
          'flex h-9 w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...rest}
      />
      {error && (
        <p class="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

export const Textarea = component$<InputProps>((props) => {
  const { class: className, error, rows = 3, ...rest } = props;

  return (
    <div class="w-full">
      <textarea
        rows={rows}
        class={cn(
          'flex min-h-[60px] w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...rest}
      />
      {error && (
        <p class="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

export const Label = component$<{ for?: string; class?: string }>((props) => {
  const { class: className, for: forId, ...rest } = props;

  return (
    <label
      for={forId}
      class={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...rest}
    >
      <slot />
    </label>
  );
});