import React, { useState } from 'react';
import { Button } from '../../components/Button';
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

  async function handleSubmit(e: React.FormEvent) {
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
        <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. Morning run"
        />
        {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
      </div>

      <div>
        <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="habit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Optional details about this habit"
        />
      </div>

      <div>
        <label htmlFor="habit-start-date" className="block text-sm font-medium text-gray-700 mb-1">
          Start date <span className="text-red-500">*</span>
        </label>
        <input
          id="habit-start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
