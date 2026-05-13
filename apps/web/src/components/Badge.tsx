import type { ReactNode } from 'react';
import { BADGE_TONE_CLASSES, COMPONENT_CLASSES, type BadgeTone } from './componentStyles';

type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
};

export function Badge({ children, tone = 'neutral' }: BadgeProps): JSX.Element {
  return (
    <span
      className={[
        COMPONENT_CLASSES.badge,
        BADGE_TONE_CLASSES[tone],
      ].join(' ')}
    >
      {children}
    </span>
  );
}
