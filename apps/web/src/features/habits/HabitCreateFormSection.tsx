import type { CreateHabitRequest, UpdateHabitRequest } from '@habit-tracker/shared';
import { HabitForm } from './HabitForm';
import type { HabitFormState } from './habitTypes';

type HabitCreateFormSectionProps = {
  formError: string | null;
  formState: HabitFormState;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (request: CreateHabitRequest | UpdateHabitRequest) => Promise<void>;
};

export function HabitCreateFormSection({
  formError,
  formState,
  isSaving,
  onCancel,
  onSubmit,
}: HabitCreateFormSectionProps): JSX.Element | null {
  if (formState?.mode !== 'create') {
    return null;
  }

  return (
    <HabitForm
      mode="create"
      isSaving={isSaving}
      serverError={formError}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}
