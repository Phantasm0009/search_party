import React from 'react';
import { TrendingUp, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { extractDomain } from '../utils/helpers';

/**
 * Component to display top voted results
 */
const TopResults = ({ results, onResultClick }) => {
  if (!results || results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No top results yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start searching and voting to see the best results here
        </p>
      </div>
    );
  }

  const handleResultClick = (searchId, url, title) => {
    // Open link in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    // Track the click if callback provided
    if (onResultClick) {
      onResultClick(searchId, url, title);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Top Voted Results
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </span>
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={`${result.searchId}_${result.url}`}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* Rank */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : index === 1
                    ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    : index === 2
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => handleResultClick(result.searchId, result.url, result.title)}
                  className="text-left w-full group"
                >
                  <h4 className="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline mb-1 truncate">
                    {result.title}
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400 mb-2">
                    {extractDomain(result.url)}
                  </p>
                  {result.snippet && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                      {result.snippet}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From search: "{result.query}"
                  </p>
                </button>
              </div>

              {/* Voting info and actions */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <ChevronUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{result.upvotes}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <ChevronDown className="h-4 w-4" />
                    <span className="text-sm font-medium">{result.downvotes}</span>
                  </div>
                </div>
                
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {result.score > 0 ? '+' : ''}{result.score}
                </div>
                
                <button
                  onClick={() => handleResultClick(result.searchId, result.url, result.title)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          How it works
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Results are ranked by their score (upvotes minus downvotes). 
          The higher the score, the more valuable the community finds the result.
        </p>
      </div>
    </div>
  );
};

export default TopResults;
