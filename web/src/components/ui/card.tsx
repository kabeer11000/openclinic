import { component$, Slot } from '@builder.io/qwik';
import { cn } from '../../lib/utils';

interface CardProps {
  class?: string;
}

export const Card = component$<CardProps>((props) => {
  const { class: className } = props;

  return (
    <div
      class={cn(
        'border border-border bg-card text-card-foreground shadow',
        className
      )}
    >
      <Slot />
    </div>
  );
});

export const CardHeader = component$<CardProps>((props) => {
  const { class: className } = props;

  return (
    <div
      class={cn(
        'flex flex-col space-y-1.5 p-6',
        className
      )}
    >
      <Slot />
    </div>
  );
});

export const CardTitle = component$<CardProps>((props) => {
  const { class: className } = props;

  return (
    <div
      class={cn(
        'font-semibold leading-none tracking-tight',
        className
      )}
    >
      <Slot />
    </div>
  );
});

export const CardDescription = component$<CardProps>((props) => {
  const { class: className } = props;

  return (
    <p
      class={cn(
        'text-sm text-muted-foreground',
        className
      )}
    >
      <Slot />
    </p>
  );
});

export const CardContent = component$<CardProps>((props) => {
  const { class: className } = props;

  return (
    <div
      class={cn(
        'p-6 pt-0',
        className
      )}
    >
      <Slot />
    </div>
  );
});

export const CardFooter = component$<CardProps>((props) => {
  const { class: className } = props;

  return (
    <div
      class={cn(
        'flex items-center p-6 pt-0',
        className
      )}
    >
      <Slot />
    </div>
  );
});