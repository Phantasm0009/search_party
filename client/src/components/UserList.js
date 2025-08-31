import React from 'react';
import { Crown, Clock } from 'lucide-react';
import { formatTimestamp } from '../utils/helpers';

/**
 * Component to display list of users in the room
 */
const UserList = ({ users, currentUser }) => {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Crown className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No users found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Waiting for people to join the room...
        </p>
      </div>
    );
  }

  // Sort users: current user first, then by join time
  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === currentUser?.id) return -1;
    if (b.id === currentUser?.id) return 1;
    return new Date(a.joinedAt) - new Date(b.joinedAt);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Room Members
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {users.length} {users.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      <div className="grid gap-3">
        {sortedUsers.map((user) => (
          <div
            key={user.id}
            className={`flex items-center space-x-3 p-4 rounded-lg border ${
              user.id === currentUser?.id
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.nickname}
                className="w-12 h-12 rounded-full"
              />
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 dark:text-white truncate">
                  {user.nickname}
                </h4>
                
                {user.id === currentUser?.id && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
                
                {user.isCreator && (
                  <Crown className="h-4 w-4 text-yellow-500" title="Room Creator" />
                )}
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Joined {formatTimestamp(user.joinedAt)}</span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="text-right">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                Online
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room stats */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          Room Statistics
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 dark:text-gray-400">Total Members</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {users.length}
            </div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400">Online Now</div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              {users.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
