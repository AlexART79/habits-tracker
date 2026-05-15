import { useState } from 'react';
import { Button } from '../../components/Button';
import { FORM_FIELD_CLASSES, FORM_LABEL_CLASSES } from './constants';
import type { CreateHabitPayload, UpdateHabitPayload } from './types';

interface HabitFormValues {
  name: string;
  description: string;
  startDate: string;
}

interface HabitFormProps {
  initialValues?: HabitFormValues;
  onSubmit: (payload: CreateHabitPayload | UpdateHabitPayload) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

export function HabitForm({ initialValues, onSubmit, onCancel, submitLabel }: HabitFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState(initialValues?.name ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [startDate, setStartDate] = useState(initialValues?.startDate?.split('T')[0] ?? today);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [serverError, setServerError] = useState('');

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Name is required.');
      return;
    }
    setNameError('');
    setServerError('');
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        startDate,
      });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="habit-name" className={FORM_LABEL_CLASSES}>
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className={FORM_FIELD_CLASSES}
          placeholder="e.g. Morning run"
        />
        {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
      </div>

      <div>
        <label htmlFor="habit-description" className={FORM_LABEL_CLASSES}>
          Description
        </label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          className={`${FORM_FIELD_CLASSES} resize-none`}
          placeholder="Optional details about this habit"
        />
      </div>

      <div>
        <label htmlFor="habit-start-date" className={FORM_LABEL_CLASSES}>
          Start date <span className="text-red-500">*</span>
        </label>
        <input
          id="habit-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={`${FORM_FIELD_CLASSES} dark:[color-scheme:dark]`}
        />
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
