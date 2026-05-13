import { useState } from 'react';
import type { CheckInResponse } from '@habit-tracker/shared';
import { listCheckIns } from '../../lib/apiClient';
import { HABIT_COPY } from './habitConstants';
import { getCurrentMonth } from './habitUtils';

export function useCheckInHistory(habitId: string) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckInResponse[] | null>(null);

  async function toggleHistory(): Promise<void> {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listCheckIns(habitId, getCurrentMonth());
      setCheckIns(response.checkIns);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : HABIT_COPY.unableToLoadCheckIns);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    checkIns,
    errorMessage,
    isExpanded,
    isLoading,
    toggleHistory,
  };
}
