import React, { useState, useEffect, useCallback } from 'react';
import { X, TrendingUp, Users, MessageCircle, Search } from 'lucide-react';

/**
 * Notification system component for real-time alerts
 */
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications

    // Auto-remove after 5 seconds unless it's pinned
    if (!notification.persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'vote':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'user_joined':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      case 'search':
        return <Search className="h-5 w-5 text-orange-500" />;
      default:
        return <div className="h-5 w-5 bg-gray-500 rounded-full" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'vote':
        return 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700';
      case 'user_joined':
        return 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700';
      case 'message':
        return 'bg-purple-50 dark:bg-purple-900 border-purple-200 dark:border-purple-700';
      case 'search':
        return 'bg-orange-50 dark:bg-orange-900 border-orange-200 dark:border-orange-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  // Global notification function that can be called from anywhere
  useEffect(() => {
    window.showNotification = addNotification;
    return () => {
      delete window.showNotification;
    };
  }, [addNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg border shadow-lg transform transition-all duration-300 animate-slide-in ${getNotificationColor(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getNotificationIcon(notification.type)}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {notification.title}
              </h4>
              {notification.message && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {notification.message}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper functions to show notifications
export const showNotification = (notification) => {
  if (window.showNotification) {
    window.showNotification(notification);
  }
};

export const showVoteNotification = (user, isUpvote) => {
  showNotification({
    type: 'vote',
    title: 'Result Voted',
    message: `${user} ${isUpvote ? 'upvoted' : 'downvoted'} a result`,
  });
};

export const showUserJoinedNotification = (nickname) => {
  showNotification({
    type: 'user_joined',
    title: 'User Joined',
    message: `${nickname} joined the room`,
  });
};

export const showNewMessageNotification = (nickname, preview) => {
  showNotification({
    type: 'message',
    title: 'New Message',
    message: `${nickname}: ${preview}`,
  });
};

export const showSearchNotification = (nickname, query) => {
  showNotification({
    type: 'search',
    title: 'New Search',
    message: `${nickname} searched for "${query}"`,
  });
};

export default NotificationSystem;
