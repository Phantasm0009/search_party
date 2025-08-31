import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useTheme } from '../hooks/useTheme';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import UserList from '../components/UserList';
import ChatPanel from '../components/ChatPanel';
import TopResults from '../components/TopResults';
import ExportPanel from '../components/ExportPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import UserPresence from '../components/UserPresence';
import ActivityFeed from '../components/ActivityFeed';
import SharedBrowser from '../components/SharedBrowser';
import NotificationSystem, { 
  showVoteNotification, 
  showUserJoinedNotification, 
  showNewMessageNotification, 
  showSearchNotification,
  showNotification
} from '../components/NotificationSystem';
import OnboardingTour, { useOnboarding } from '../components/OnboardingTour';
import { 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Download, 
  Moon,
  Sun,
  Home,
  Copy,
  Check,
  HelpCircle,
  Activity,
  Globe
} from 'lucide-react';
import { copyToClipboard, generateNickname } from '../utils/helpers';

/**
 * Main room component where collaborative searching happens
 */
const Room = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { socket, connected, emit, on } = useSocket();
  
  // Room state
  const [room, setRoom] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searches, setSearches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [topResults, setTopResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinError, setJoinError] = useState(null);
  
  // UI state
  const [activePanel, setActivePanel] = useState('searches'); // searches, chat, users, top-results, export, shared
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Shared browsing state
  const [sharedBrowsingState, setSharedBrowsingState] = useState({
    enabled: true,
    currentUrl: null,
    currentTitle: null,
    lastNavigatedBy: null
  });
  
  // Real-time presence indicators
  const [typingUsers] = useState([]);
  const [searchingUsers] = useState([]);
  
  // Onboarding
  const { showOnboarding, startOnboarding, completeOnboarding } = useOnboarding();
  
  // Refs
  const messagesEndRef = useRef(null);
  const hasJoinedRoom = useRef(false);

  // Initialize user from navigation state or generate
  useEffect(() => {
    const userData = location.state?.user;
    if (userData) {
      setUser({
        ...userData,
        id: Math.random().toString(36).substring(7),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.nickname}`
      });
    } else {
      // Generate anonymous user
      const nickname = generateNickname();
      setUser({
        id: Math.random().toString(36).substring(7),
        nickname,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`,
        isCreator: false
      });
    }
    // Reset room join flag when user changes
    hasJoinedRoom.current = false;
  }, [location.state, roomId]);

  // Join room when socket connects and user is ready
  useEffect(() => {
    if (connected && user && roomId && !hasJoinedRoom.current) {
      console.log('Joining room:', roomId, 'as:', user.nickname);
      hasJoinedRoom.current = true;
      emit('join_room', { roomId, user });
    }
  }, [connected, user, roomId, emit]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const unsubscribers = [
      on('room_joined', (data) => {
        console.log('Room joined successfully:', data);
        setRoom(data.room);
        setUsers(data.users || []);
        setSearches(data.searches || []);
        setMessages(data.messages || []);
        setTopResults(data.topResults || []);
        
        // Update shared browsing state from room data
        if (data.room?.sharedBrowsing) {
          setSharedBrowsingState({
            enabled: data.room.sharedBrowsing.enabled,
            currentUrl: data.room.sharedBrowsing.currentUrl,
            currentTitle: data.room.sharedBrowsing.currentTitle,
            lastNavigatedBy: data.room.sharedBrowsing.lastNavigatedBy
          });
        }
        
        setLoading(false);
        setJoinError(null);
      }),

      on('user_joined', (userData) => {
        setUsers(prev => [...prev, userData]);
        showUserJoinedNotification(userData.nickname);
      }),

      on('user_left', (userData) => {
        setUsers(prev => prev.filter(u => u.id !== userData.id));
      }),

      on('search_added', (search) => {
        setSearches(prev => [search, ...prev]);
        const searchUser = users.find(u => u.id === search.userId);
        if (searchUser && search.userId !== user?.id) {
          showSearchNotification(searchUser.nickname, search.query);
        }
      }),

      on('message_received', (message) => {
        setMessages(prev => [...prev, message]);
        const messageUser = users.find(u => u.id === message.userId);
        if (messageUser && message.userId !== user?.id) {
          showNewMessageNotification(messageUser.nickname, message.message.substring(0, 50));
        }
      }),

      on('top_results_updated', (results) => {
        setTopResults(results);
      }),

      on('vote_updated', (voteData) => {
        // Update the specific result's vote count in searches
        setSearches(prev => prev.map(search => {
          if (search.id === voteData.searchId) {
            return {
              ...search,
              results: search.results?.map(result => {
                if (result.url === voteData.url) {
                  return {
                    ...result,
                    upvotes: voteData.upvotes,
                    downvotes: voteData.downvotes,
                    userVote: voteData.userVote
                  };
                }
                return result;
              })
            };
          }
          return search;
        }));
        
        // Show notification for votes
        if (voteData.userId !== user?.id) {
          const votingUser = users.find(u => u.id === voteData.userId);
          if (votingUser) {
            showVoteNotification(votingUser.nickname, voteData.voteType === 'up');
          }
        }
      }),

      on('result_clicked', (clickData) => {
        // Update click count for the result
        setSearches(prev => prev.map(search => {
          if (search.id === clickData.searchId) {
            return {
              ...search,
              clickCount: (search.clickCount || 0) + 1
            };
          }
          return search;
        }));
      }),

      on('user_clicked_link', (clickData) => {
        // Show notification when someone else clicks a link
        if (clickData.userId !== user?.id) {
          const domain = new URL(clickData.url).hostname;
          showNotification({
            type: 'search',
            title: 'Link Opened',
            message: `${clickData.userNickname} is viewing ${domain}`,
          });
        }
      }),

      on('shared_navigation', (navigationData) => {
        setSharedBrowsingState(prev => ({
          ...prev,
          currentUrl: navigationData.url,
          currentTitle: navigationData.title,
          lastNavigatedBy: {
            nickname: navigationData.navigatedBy,
            timestamp: navigationData.timestamp
          }
        }));

        // Show notification for shared navigation
        if (navigationData.navigatedBy !== user?.nickname) {
          const domain = new URL(navigationData.url).hostname;
          showNotification({
            type: 'shared_navigation',
            title: 'Shared Navigation',
            message: `${navigationData.navigatedBy} opened ${domain}`,
          });
        }

        // Auto-switch to shared browser panel if not already there
        if (sharedBrowsingState.enabled && activePanel !== 'shared') {
          setActivePanel('shared');
        }
      }),

      on('shared_browsing_toggled', (toggleData) => {
        setSharedBrowsingState(prev => ({
          ...prev,
          enabled: toggleData.enabled,
          currentUrl: toggleData.enabled ? prev.currentUrl : null,
          currentTitle: toggleData.enabled ? prev.currentTitle : null,
          lastNavigatedBy: toggleData.enabled ? prev.lastNavigatedBy : null
        }));

        // Show notification
        showNotification({
          type: 'settings',
          title: 'Shared Browsing',
          message: `${toggleData.toggledBy} ${toggleData.enabled ? 'enabled' : 'disabled'} shared browsing`,
        });
      }),

      on('shared_scroll_update', (scrollData) => {
        // Handle scroll synchronization if needed
        // This could be used to sync scroll positions in the future
      }),

      on('iframe_state_received', (stateData) => {
        // Handle iframe state updates from other users
        if (stateData.title) {
          setSharedBrowsingState(prev => ({
            ...prev,
            currentTitle: stateData.title
          }));
        }
      }),

      on('error', (errorData) => {
        console.error('Socket error:', errorData);
        setJoinError(errorData.message || 'An error occurred');
        setLoading(false);
      })
    ];

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [socket, on, users, user?.id, user?.nickname, activePanel, sharedBrowsingState.enabled, setActivePanel]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle search submission
  const handleSearch = (query, results) => {
    if (!connected || !user) return;
    
    emit('new_search', {
      query,
      results
    });
  };

  // Handle vote
  const handleVote = (searchId, url, voteType) => {
    if (!connected || !user) return;
    
    emit('vote_result', {
      searchId,
      url,
      type: voteType
    });
  };

  // Handle result click
  const handleResultClick = (searchId, url, title) => {
    if (!connected || !user) return;
    
    emit('result_click', {
      searchId,
      url,
      title
    });
  };

  // Handle chat message
  const handleSendMessage = (message) => {
    if (!connected || !user) return;
    
    emit('send_message', { message });
  };

  // Handle shared browsing toggle
  const handleToggleSharedBrowsing = (enabled) => {
    if (!connected || !user) return;
    
    emit('toggle_shared_browsing', { enabled });
  };

  // Copy room link
  const handleCopyLink = async () => {
    const roomLink = window.location.href;
    const success = await copyToClipboard(roomLink);
    if (success) {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {connected ? 'Joining room...' : 'Connecting to server...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (joinError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg mb-4">
            <p className="text-red-800 dark:text-red-200">{joinError}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const panelButtons = [
    { id: 'searches', label: 'Searches', icon: TrendingUp, count: searches.length },
    { id: 'shared', label: 'Shared Browser', icon: Globe, 
      active: sharedBrowsingState.enabled && sharedBrowsingState.currentUrl },
    { id: 'chat', label: 'Chat', icon: MessageCircle, count: messages.length },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'top-results', label: 'Top Results', icon: TrendingUp, count: topResults.length },
    { id: 'export', label: 'Export', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Notification System */}
      <NotificationSystem />
      
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Home className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {room?.name || 'Search Room'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                Room ID: {roomId}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Connection status */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Copy room link */}
            <button
              onClick={handleCopyLink}
              className="room-link flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {linkCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
              <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                {linkCopied ? 'Copied!' : 'Copy Link'}
              </span>
            </button>

            {/* Help button */}
            <button
              onClick={startOnboarding}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Show tutorial"
            >
              <HelpCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        {/* Search area */}
        <div className="flex-1 flex flex-col">
          {/* Search bar */}
          <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="search-bar">
              <SearchBar onSearch={handleSearch} disabled={!connected} />
            </div>
          </div>

          {/* Mobile panel selector */}
          <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto">
              {panelButtons.map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                    activePanel === panel.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <panel.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{panel.label}</span>
                  {panel.count !== undefined && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
                      {panel.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content area based on active panel */}
          <div className="flex-1 overflow-auto p-4">
            {activePanel === 'searches' && (
              <SearchResults
                searches={searches}
                currentUser={user}
                onVote={handleVote}
                onResultClick={handleResultClick}
              />
            )}
            
            {activePanel === 'shared' && (
              <SharedBrowser
                socket={socket}
                on={on}
                emit={emit}
                currentUser={user}
                sharedBrowsingState={sharedBrowsingState}
                onToggleSharedBrowsing={handleToggleSharedBrowsing}
              />
            )}
            
            {activePanel === 'chat' && (
              <div className="chat-panel">
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUser={user}
                />
              </div>
            )}
            
            {activePanel === 'users' && (
              <div className="space-y-6">
                <UserPresence
                  users={users}
                  currentUser={user}
                  typingUsers={typingUsers}
                  searchingUsers={searchingUsers}
                />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <UserList users={users} currentUser={user} />
                </div>
              </div>
            )}
            
            {activePanel === 'activity' && (
              <ActivityFeed 
                socket={socket}
                on={on}
                currentUser={user}
              />
            )}
            
            {activePanel === 'top-results' && (
              <TopResults
                results={topResults}
                onResultClick={handleResultClick}
              />
            )}
            
            {activePanel === 'export' && (
              <ExportPanel
                room={room}
                searches={searches}
                topResults={topResults}
                users={users}
              />
            )}
          </div>
        </div>

        {/* Right sidebar - Panel navigation (Desktop only) */}
        <div className="panel-navigation hidden lg:flex w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white">Panels</h3>
          </div>
          
          <div className="flex-1 overflow-auto">
            {panelButtons.map((panel) => (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  activePanel === panel.id
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <panel.icon className="h-5 w-5" />
                  <span className="font-medium">{panel.label}</span>
                </div>
                {panel.count !== undefined && (
                  <span className="text-sm bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded-full">
                    {panel.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
