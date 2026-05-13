import { useEffect, useState, type FormEvent } from 'react';
import type { CreateHabitRequest, HabitResponse, UpdateHabitRequest } from '@habit-tracker/shared';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

type HabitFormMode = 'create' | 'edit';

type HabitFormProps = {
  mode: HabitFormMode;
  habit?: HabitResponse;
  isSaving: boolean;
  serverError: string | null;
  onCancel: () => void;
  onSubmit: (request: CreateHabitRequest | UpdateHabitRequest) => Promise<void>;
};

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function HabitForm({
  habit,
  isSaving,
  mode,
  onCancel,
  onSubmit,
  serverError,
}: HabitFormProps): JSX.Element {
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
      setValidationError('Name is required.');
      return;
    }

    setValidationError(null);
    await onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      startDate,
    });
  }

  return (
    <form
      aria-label={mode === 'create' ? 'Create habit form' : 'Edit habit form'}
      className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Habit name"
          name="habit-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSaving}
          maxLength={120}
        />
        <Input
          label="Start date"
          name="habit-start-date"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="grid gap-1.5">
        <label className="font-bold text-slate-800" htmlFor="habit-description">
          Description
        </label>
        <textarea
          id="habit-description"
          name="habit-description"
          className={[
            'min-h-24 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-slate-950',
            'transition-colors placeholder:text-slate-400 hover:border-slate-400',
            'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-sky-300',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70',
          ].join(' ')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSaving}
          maxLength={500}
        />
      </div>

      {validationError ?? serverError ? (
        <p role="alert" className="font-medium text-red-700">
          {validationError ?? serverError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {mode === 'create' ? 'Save habit' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
