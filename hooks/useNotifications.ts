
import React, { useState, useCallback } from 'react';
import type { Notification, NotificationType } from '../types';
import type { ReactNode } from 'react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((type: NotificationType, message: string, details?: ReactNode) => {
    const id = Date.now();
    setNotifications(current => [...current, { id, type, message, details }]);
    setTimeout(() => {
      setNotifications(current => current.filter(n => n.id !== id));
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications(current => current.filter(n => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
};
