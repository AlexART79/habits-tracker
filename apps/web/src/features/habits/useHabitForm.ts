import { useEffect, useState, type FormEvent } from 'react';
import type { CreateHabitRequest, HabitResponse, UpdateHabitRequest } from '@habit-tracker/shared';
import { HABIT_COPY } from './habitConstants';
import { getTodayDate } from './habitUtils';

type UseHabitFormOptions = {
  habit?: HabitResponse;
  onSubmit: (request: CreateHabitRequest | UpdateHabitRequest) => Promise<void>;
};

export function useHabitForm({ habit, onSubmit }: UseHabitFormOptions) {
  const [name, setName] = useState(habit?.name ?? '');
  const [description, setDescription] = useState(habit?.description ?? '');
  const [startDate, setStartDate] = useState(habit?.startDate ?? getTodayDate());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setName(habit?.name ?? '');
    setDescription(habit?.description ?? '');
    setStartDate(habit?.startDate ?? getTodayDate());
    setValidationError(null);
  }, [habit]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!name.trim()) {
      setValidationError(HABIT_COPY.nameRequired);
      return;
    }

    setValidationError(null);
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      startDate,
    });
  }

  return {
    description,
    name,
    startDate,
    validationError,
    handleSubmit,
    setDescription,
    setName,
    setStartDate,
  };
}
