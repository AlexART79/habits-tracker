import React, { useState } from 'react';
import { AuthUser } from '../auth/useAuth';
import { IconBtn } from './IconBtn';
import { IconLogout } from './icons';

interface UserInfoProps {
  user: AuthUser;
  onLogout: () => void;
}

function getInitials(displayName: string | null): string {
  if (!displayName) return '?';
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserInfo({ user, onLogout }: UserInfoProps) {
  const [imgError, setImgError] = useState(false);
  const showAvatar = !!user.avatarUrl && !imgError;

  return (
    <div className="flex items-center gap-3">
      {showAvatar ? (
        <img
          src={user.avatarUrl!}
          alt={user.displayName ?? 'User avatar'}
          onError={() => setImgError(true)}
          className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold select-none">
          {getInitials(user.displayName)}
        </div>
      )}

      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {user.displayName ?? user.email ?? 'User'}
      </span>

      <IconBtn title="Log out" onClick={onLogout}>
        <IconLogout />
      </IconBtn>
    </div>
  );
}
