import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

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
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;

  return (
    <div className="grid gap-1.5">
      <label className="font-bold text-slate-800" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        className={[
          'min-h-11 w-full rounded-md border border-slate-300 bg-white px-3.5 text-slate-950',
          'transition-colors placeholder:text-slate-400 hover:border-slate-400',
          'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-sky-300',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  );
}
