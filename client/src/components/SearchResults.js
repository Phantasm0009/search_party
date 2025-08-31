import React from 'react';
import { ChevronUp, ChevronDown, ExternalLink, Clock, User } from 'lucide-react';
import { formatTimestamp, extractDomain } from '../utils/helpers';

/**
 * Component to display search results with voting and user info
 */
const SearchResults = ({ searches, currentUser, onVote, onResultClick }) => {
  if (!searches || searches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No searches yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start searching to see results appear here
        </p>
      </div>
    );
  }

  const handleResultClick = (searchId, url, title) => {
    // Open link in new tab with better window management
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer,width=1200,height=800,scrollbars=yes,resizable=yes');
    
    // Focus the new window if it opened successfully
    if (newWindow) {
      newWindow.focus();
    }
    
    // Track the click for analytics and notifications
    onResultClick(searchId, url, title);
  };

  return (
    <div className="space-y-6">
      {searches.map((search) => (
        <div
          key={search.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          {/* Search header */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={search.userAvatar}
              alt={search.userNickname}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {search.userNickname}
                </h3>
                {search.userId === currentUser?.id && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>Searched "{search.query}"</span>
                <span>•</span>
                <span>{formatTimestamp(search.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Search results */}
          {search.results && search.results.length > 0 && (
            <div className="space-y-3">
              {search.results.map((result, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => handleResultClick(search.id, result.url, result.title)}
                        className="text-left w-full group"
                      >
                        <h4 className="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline mb-1 truncate">
                          {result.title}
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                          {extractDomain(result.url)}
                        </p>
                        {result.snippet && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {result.snippet}
                          </p>
                        )}
                      </button>
                    </div>

                    {/* Voting buttons */}
                    <div className="vote-buttons flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => onVote(search.id, result.url, 'up')}
                        className={`p-2 rounded-lg transition-colors ${
                          result.userVote === 'up'
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                        title="Upvote"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      
                      <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-center">
                        {(result.upvotes || 0) - (result.downvotes || 0)}
                      </span>
                      
                      <button
                        onClick={() => onVote(search.id, result.url, 'down')}
                        className={`p-2 rounded-lg transition-colors ${
                          result.userVote === 'down'
                            ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
                        }`}
                        title="Downvote"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleResultClick(search.id, result.url, result.title)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
                        title="Open link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {(!search.results || search.results.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No results found for this search
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
