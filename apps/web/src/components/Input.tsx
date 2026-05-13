import type { InputHTMLAttributes } from 'react';
import { COMPONENT_CLASSES } from './componentStyles';
import { useInputId } from './useInputId';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Input({
  className = '',
  id,
  label,
  name,
  ...props
}: InputProps): JSX.Element {
  const inputId = useInputId(id, name);

  return (
    <div className="grid gap-1.5">
      <label className="font-bold text-slate-800 dark:text-slate-200" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={[
          COMPONENT_CLASSES.input,
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
