import React from 'react';
import { useNotificationStore, type Notification } from '../store/notificationStore';
import Icon from './Icon';
import Button from './Button';

interface NotificationItemProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
  const { id, type, title, message } = notification;
  
  const getIconName = () => {
    switch (type) {
      case 'success': return 'save';
      case 'error': return 'close';
      case 'warning': return 'x';
      case 'info': return 'file';
      default: return 'file';
    }
  };
  
  const getColorClasses = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-900';
      case 'error': return 'bg-red-50 border-red-200 text-red-900';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-900';
      default: return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };
  
  const getIconColorClasses = () => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };
  
  return (
    <div className={`
      relative rounded-lg border p-4 shadow-lg max-w-sm w-full
      transform transition-all duration-300 ease-in-out
      hover:shadow-xl hover:scale-105
      ${getColorClasses()}
    `}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${getIconColorClasses()}`}>
          <Icon name={getIconName()} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{title}</h4>
          {message && (
            <p className="text-xs mt-1 opacity-80">{message}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(id)}
          className="flex-shrink-0 p-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <Icon name="close" size="sm" />
        </Button>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer; 