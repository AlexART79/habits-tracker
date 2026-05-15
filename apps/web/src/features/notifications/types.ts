export interface MilestoneReachedPayload {
  notificationId: string;
  habitId: string;
  habitName: string;
  milestone: number;
  currentStreak: number;
}
