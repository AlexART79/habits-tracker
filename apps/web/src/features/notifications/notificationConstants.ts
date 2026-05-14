export const NOTIFICATION_COPY = {
  regionLabel: 'Milestone notifications',
  dismissLabel: (habitName: string) => `Dismiss ${habitName} milestone`,
  milestoneMessage: (habitName: string, milestone: number) =>
    `${habitName} reached a ${milestone}-day streak.`,
} as const;
