import type { CreateHabitRequest, HabitResponse, UpdateHabitRequest } from '@habit-tracker/shared';
import { Save, X } from 'lucide-react';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { HABIT_ARIA, HABIT_COPY, HABIT_LIMITS } from './habitConstants';
import { useHabitForm } from './useHabitForm';

type HabitFormMode = 'create' | 'edit';

type HabitFormProps = {
  mode: HabitFormMode;
  habit?: HabitResponse;
  isSaving: boolean;
  serverError: string | null;
  onCancel: () => void;
  onSubmit: (request: CreateHabitRequest | UpdateHabitRequest) => Promise<void>;
};

export function HabitForm({
  habit,
  isSaving,
  mode,
  onCancel,
  onSubmit,
  serverError,
}: HabitFormProps): JSX.Element {
  const form = useHabitForm({ habit, onSubmit });

  return (
    <form
      aria-label={mode === 'create' ? HABIT_ARIA.createForm : HABIT_ARIA.editForm}
      className="grid gap-4 rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/75"
      onSubmit={(event) => void form.handleSubmit(event)}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={HABIT_COPY.habitName}
          name="habit-name"
          value={form.name}
          onChange={(event) => form.setName(event.target.value)}
          disabled={isSaving}
          maxLength={HABIT_LIMITS.nameMaxLength}
        />
        <Input
          label={HABIT_COPY.startDate}
          name="habit-start-date"
          type="date"
          value={form.startDate}
          onChange={(event) => form.setStartDate(event.target.value)}
          disabled={isSaving}
        />
      </div>

      <div className="grid gap-1.5">
        <label className="font-bold text-slate-800 dark:text-slate-200" htmlFor="habit-description">
          {HABIT_COPY.description}
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
          value={form.description}
          onChange={(event) => form.setDescription(event.target.value)}
          disabled={isSaving}
          maxLength={HABIT_LIMITS.descriptionMaxLength}
        />
      </div>

      {form.validationError ?? serverError ? (
        <Alert>{form.validationError ?? serverError}</Alert>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {mode === 'create' ? HABIT_COPY.saveHabit : HABIT_COPY.saveChanges}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
          <X className="h-4 w-4" aria-hidden="true" />
          {HABIT_COPY.cancel}
        </Button>
      </div>
    </form>
  );
}
