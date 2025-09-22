import { component$, Slot } from '@builder.io/qwik';
import { cn } from '../../lib/utils';

interface TableProps {
  class?: string;
}

export const Table = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <div class="relative w-full overflow-auto">
      <table
        class={cn(
          'w-full caption-bottom text-sm',
          className
        )}
      >
        <Slot />
      </table>
    </div>
  );
});

export const TableHeader = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <thead class={cn('[&_tr]:border-b', className)}>
      <Slot />
    </thead>
  );
});

export const TableBody = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <tbody class={cn('[&_tr:last-child]:border-0', className)}>
      <Slot />
    </tbody>
  );
});

export const TableFooter = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <tfoot class={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)}>
      <Slot />
    </tfoot>
  );
});

export const TableRow = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <tr
      class={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
    >
      <Slot />
    </tr>
  );
});

export const TableHead = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <th
      class={cn(
        'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
    >
      <Slot />
    </th>
  );
});

export const TableCell = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <td
      class={cn(
        'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        className
      )}
    >
      <Slot />
    </td>
  );
});

export const TableCaption = component$<TableProps>((props) => {
  const { class: className } = props;

  return (
    <caption
      class={cn(
        'mt-4 text-sm text-muted-foreground',
        className
      )}
    >
      <Slot />
    </caption>
  );
});