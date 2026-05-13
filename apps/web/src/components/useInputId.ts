import { useId } from 'react';

export function useInputId(id?: string, name?: string): string {
  const generatedId = useId();

  return id ?? name ?? generatedId;
}
