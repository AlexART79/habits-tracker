import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';
import { COMPONENT_CLASSES } from './componentStyles';
import { useInputId } from './useInputId';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
};

export function Select({
  children,
  className = '',
  id,
  label,
  name,
  ...props
}: SelectProps): JSX.Element {
  const selectId = useInputId(id, name);

  return (
    <label className="grid gap-1.5 font-bold text-slate-800 dark:text-slate-200" htmlFor={selectId}>
      {label}
      <span className="relative">
        <select
          id={selectId}
          name={name}
          className={[COMPONENT_CLASSES.select, className].join(' ')}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-300"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
