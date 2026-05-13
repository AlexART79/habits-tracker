import { useEffect, useState, type FormEvent } from 'react';
import type { CreateHabitRequest, HabitResponse, UpdateHabitRequest } from '@habit-tracker/shared';
import { Save, X } from 'lucide-react';
import { Alert } from '../../components/Alert';
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
      className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/75"
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
        <label className="font-bold text-slate-800 dark:text-slate-200" htmlFor="habit-description">
          Description
        </label>
        <textarea
          id="habit-description"
          name="habit-description"
          className={[
            'min-h-24 w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-slate-950',
            'transition-colors placeholder:text-slate-400 hover:border-slate-400',
            'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-emerald-300',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-70',
            'dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-slate-600 dark:disabled:bg-slate-800',
          ].join(' ')}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSaving}
          maxLength={500}
        />
      </div>

      {validationError ?? serverError ? (
        <Alert>{validationError ?? serverError}</Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {mode === 'create' ? 'Save habit' : 'Save changes'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
