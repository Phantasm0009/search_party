import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, TrendingUp, MessageCircle, Users, Clock } from 'lucide-react';

/**
 * Activity feed component to show recent room activity
 */
const ActivityFeed = ({ socket, on, currentUser }) => {
  const [activities, setActivities] = useState([]);
  const maxActivities = 10;

  useEffect(() => {
    if (!socket || !on) return;

    const unsubscribers = [
      on('user_joined', (userData) => {
        if (userData.id !== currentUser?.id) {
          addActivity({
            type: 'user_joined',
            icon: Users,
            message: `${userData.nickname} joined the room`,
            timestamp: new Date(),
            user: userData
          });
        }
      }),

      on('search_added', (search) => {
        if (search.userId !== currentUser?.id) {
          addActivity({
            type: 'search',
            icon: Search,
            message: `${search.userNickname} searched for "${search.query}"`,
            timestamp: new Date(search.timestamp),
            user: { nickname: search.userNickname, avatar: search.userAvatar }
          });
        }
      }),

      on('user_clicked_link', (clickData) => {
        if (clickData.userId !== currentUser?.id) {
          const domain = new URL(clickData.url).hostname;
          addActivity({
            type: 'link_click',
            icon: ExternalLink,
            message: `${clickData.userNickname} opened ${domain}`,
            timestamp: new Date(clickData.timestamp),
            user: { nickname: clickData.userNickname }
          });
        }
      }),

      on('vote_updated', (voteData) => {
        if (voteData.userId !== currentUser?.id) {
          const action = voteData.voteType === 'up' ? 'upvoted' : 'downvoted';
          addActivity({
            type: 'vote',
            icon: TrendingUp,
            message: `Someone ${action} a result`,
            timestamp: new Date(),
            user: null // Keep anonymous for votes
          });
        }
      }),

      on('message_received', (message) => {
        if (message.userId !== currentUser?.id) {
          addActivity({
            type: 'message',
            icon: MessageCircle,
            message: `${message.userNickname}: ${message.message.substring(0, 40)}${message.message.length > 40 ? '...' : ''}`,
            timestamp: new Date(message.timestamp),
            user: { nickname: message.userNickname, avatar: message.userAvatar }
          });
        }
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [socket, on, currentUser?.id]);

  const addActivity = (activity) => {
    setActivities(prev => {
      const newActivities = [activity, ...prev];
      return newActivities.slice(0, maxActivities);
    });
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timestamp.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Clock className="h-8 w-8 mx-auto mb-2" />
        <p>No recent activity</p>
        <p className="text-sm mt-1">Activity from other users will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Recent Activity
      </h4>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {/* Icon */}
            <div className={`p-2 rounded-full ${
              activity.type === 'user_joined' ? 'bg-blue-100 dark:bg-blue-900' :
              activity.type === 'search' ? 'bg-green-100 dark:bg-green-900' :
              activity.type === 'link_click' ? 'bg-orange-100 dark:bg-orange-900' :
              activity.type === 'vote' ? 'bg-purple-100 dark:bg-purple-900' :
              'bg-gray-100 dark:bg-gray-600'
            }`}>
              <activity.icon className={`h-4 w-4 ${
                activity.type === 'user_joined' ? 'text-blue-600 dark:text-blue-400' :
                activity.type === 'search' ? 'text-green-600 dark:text-green-400' :
                activity.type === 'link_click' ? 'text-orange-600 dark:text-orange-400' :
                activity.type === 'vote' ? 'text-purple-600 dark:text-purple-400' :
                'text-gray-600 dark:text-gray-400'
              }`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.message}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatTime(activity.timestamp)}
              </p>
            </div>

            {/* User avatar (if available) */}
            {activity.user?.avatar && (
              <img
                src={activity.user.avatar}
                alt={activity.user.nickname}
                className="w-6 h-6 rounded-full"
              />
            )}
          </div>
        ))}
      </div>

      {activities.length >= maxActivities && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          Showing last {maxActivities} activities
        </p>
      )}
    </div>
  );
};

export default ActivityFeed;
