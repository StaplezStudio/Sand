
import React from 'react';
import type { Notification } from '../types';
import { CheckCircleIcon, XCircleIcon, InfoCircleIcon } from './icons';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

const icons = {
  success: <CheckCircleIcon className="h-6 w-6 text-green-400" />,
  error: <XCircleIcon className="h-6 w-6 text-red-400" />,
  info: <InfoCircleIcon className="h-6 w-6 text-blue-400" />,
};

const borderColors = {
  success: 'border-green-500',
  error: 'border-red-500',
  info: 'border-blue-500',
};

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  return (
    <div className={`
      w-full max-w-sm rounded-lg shadow-lg pointer-events-auto 
      bg-gray-800 border-l-4 ${borderColors[notification.type]} 
      ring-1 ring-black ring-opacity-5 overflow-hidden
      animate-fade-in-up
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icons[notification.type]}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-100">{notification.message}</p>
            {notification.details && <div className="mt-1 text-sm text-gray-400">{notification.details}</div>}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onDismiss(notification.id)}
              className="inline-flex rounded-md bg-gray-800 text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-800"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
