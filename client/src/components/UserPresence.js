import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Eye } from 'lucide-react';

/**
 * Component to show user presence indicators and activity status
 */
const UserPresence = ({ users, currentUser, typingUsers = [], searchingUsers = [] }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    // Filter online users (excluding current user)
    const online = users.filter(user => user.id !== currentUser?.id);
    setOnlineUsers(online);
  }, [users, currentUser]);

  const getUserActivity = (userId) => {
    if (typingUsers.includes(userId)) return 'typing';
    if (searchingUsers.includes(userId)) return 'searching';
    return 'online';
  };

  const getActivityIcon = (activity) => {
    switch (activity) {
      case 'typing':
        return <MessageCircle className="h-3 w-3 text-blue-500" />;
      case 'searching':
        return <Search className="h-3 w-3 text-green-500" />;
      default:
        return <Eye className="h-3 w-3 text-gray-400" />;
    }
  };

  const getActivityText = (activity) => {
    switch (activity) {
      case 'typing':
        return 'typing...';
      case 'searching':
        return 'searching...';
      default:
        return 'online';
    }
  };

  if (onlineUsers.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        You're the only one here. Share the room link to invite others!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Online Users ({onlineUsers.length})
      </h4>
      
      <div className="space-y-2">
        {onlineUsers.map((user) => {
          const activity = getUserActivity(user.id);
          return (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.nickname}
                  className="w-8 h-8 rounded-full"
                />
                {/* Online indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700" />
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.nickname}
                </p>
                <div className="flex items-center space-x-1">
                  {getActivityIcon(activity)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getActivityText(activity)}
                  </span>
                </div>
              </div>

              {/* Join time */}
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(user.joinedAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {typingUsers.length === 1 
                ? `${users.find(u => u.id === typingUsers[0])?.nickname} is typing...`
                : `${typingUsers.length} people are typing...`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPresence;
