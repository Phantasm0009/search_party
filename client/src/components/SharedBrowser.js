import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Globe, 
  Users, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Home,
  AlertCircle,
  Loader2
} from 'lucide-react';

/**
 * Shared Browser Component for collaborative web browsing
 * Displays shared web pages in an iframe with real-time synchronization
 */
const SharedBrowser = ({ 
  socket, 
  on, 
  emit, 
  currentUser, 
  sharedBrowsingState, 
  onToggleSharedBrowsing 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualUrl, setManualUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [iframeHeight, setIframeHeight] = useState('600px');
  const iframeRef = useRef(null);

  const { enabled, currentUrl, currentTitle, lastNavigatedBy } = sharedBrowsingState;

  // Handle iframe load events
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // Try to get title from iframe (may be blocked by CORS)
        try {
          const title = iframe.contentDocument?.title;
          if (title && title !== currentTitle) {
            emit('iframe_state_update', { title });
          }
        } catch (e) {
          // CORS blocked - this is expected for many sites
        }
      }
    } catch (e) {
      console.warn('Could not access iframe content:', e);
    }
  }, [emit, currentTitle]);

  // Handle iframe errors
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load page. This may be due to the site\'s security policy.');
  }, []);

  // Handle manual URL navigation
  const handleManualNavigation = (e) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;

    let url = manualUrl.trim();
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setIsLoading(true);
    setError(null);
    emit('navigate_shared', { url, title: 'Loading...' });
    setManualUrl('');
    setShowUrlInput(false);
  };

  // Listen for shared navigation events
  useEffect(() => {
    if (!socket || !on) return;

    const handleSharedNavigation = (data) => {
      setIsLoading(true);
      setError(null);
    };

    const handleIframeStateReceived = (data) => {
      // Handle iframe state updates from other users
      if (data.title && data.title !== currentTitle) {
        // Title updated by another user
      }
    };

    const unsubscribeNavigation = on('shared_navigation', handleSharedNavigation);
    const unsubscribeIframeState = on('iframe_state_received', handleIframeStateReceived);

    return () => {
      unsubscribeNavigation();
      unsubscribeIframeState();
    };
  }, [socket, on, currentTitle]);

  // Auto-adjust iframe height based on window size
  useEffect(() => {
    const updateHeight = () => {
      const windowHeight = window.innerHeight;
      const headerHeight = 200; // Approximate header height
      const newHeight = Math.max(400, windowHeight - headerHeight);
      setIframeHeight(`${newHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <EyeOff className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Shared Browsing Disabled
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          Turn on shared browsing to view web pages together with your team. 
          When enabled, links clicked by anyone will open for everyone.
        </p>
        <button
          onClick={() => onToggleSharedBrowsing(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Eye className="h-4 w-4" />
          <span>Enable Shared Browsing</span>
        </button>
      </div>
    );
  }

  if (!currentUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <Globe className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Page Selected
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
          Click on a search result to start browsing together, or enter a URL manually.
        </p>
        <button
          onClick={() => setShowUrlInput(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>Navigate to URL</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Globe className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentTitle || 'Loading...'}
              </h3>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUrl}
            </p>
            {lastNavigatedBy && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Opened by {lastNavigatedBy.nickname}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Navigate to URL"
          >
            <Home className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => window.open(currentUrl, '_blank')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Open in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onToggleSharedBrowsing(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Disable shared browsing"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="p-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleManualNavigation} className="flex space-x-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Enter URL (e.g., wikipedia.org)"
              className="flex-1 input text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!manualUrl.trim()}
              className="btn-primary px-3 py-2 text-sm"
            >
              Go
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="btn-secondary px-3 py-2 text-sm"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Shared Browser Content */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading page...</span>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={currentUrl}
          style={{ height: iframeHeight }}
          className="w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={currentTitle || 'Shared Browser'}
        />
      </div>

      {/* Shared Browsing Indicator */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
          <Users className="h-4 w-4" />
          <span className="text-sm font-medium">Shared Browsing Active</span>
          <span className="text-xs text-blue-600 dark:text-blue-300">
            Everyone in the room can see this page
          </span>
        </div>
      </div>
    </div>
  );
};

export default SharedBrowser;
