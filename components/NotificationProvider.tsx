import React from 'react';
import type { Notification } from '../types';
import NotificationToast from './NotificationToast';

interface NotificationListProps {
  notifications: Notification[];
  removeNotification: (id: number) => void;
}

const NotificationProvider: React.FC<NotificationListProps> = ({ notifications, removeNotification }) => {
  return (
    <div
      aria-live="assertive"
      className="fixed top-0 left-0 z-50 flex w-full max-w-sm flex-col space-y-4 p-4 pointer-events-none sm:p-6"
    >
      {notifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationProvider;